// tools/split.mjs — M0 文本管线：解码 → 清噪/分章 → 段落组装 → 断句 → 统计
// 用法: node tools/split.mjs <书.txt> [输出目录]
// 产出:
//   out/split-report.txt       统计报告（UTF-8）
//   out/book.sentences.json    全本句子流（供 M0 阅读器直接消费）
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const srcFile = process.argv[2] ?? resolve(HERE, '..', '【名著】《百年孤独》（校对全本）作者：加西亚·马尔克斯_著_黄锦炎译.txt');
const outDir = process.argv[3] ?? resolve(HERE, 'out');
mkdirSync(outDir, { recursive: true });

// ---------- 配置（对应设计文档 §5.3 / §8） ----------
const CFG = {
  longThreshold: 72,       // 超长句切分阈值（字）
  minFrag: 8,              // 软切分后的最小碎片长度（低于此不切）
  semicolonSplit: true,    // 分号是否作为句界（规则5）
  attributionSplit: true,  // 说话人标签式切分：冒号后紧跟引号 → 在冒号处切（他说：|“……”）[§13#1 拍板：需要切]
};

// ---------- 字符集 ----------
const OPENER = new Set(['“', '「', '『', '‘']);
const CLOSER = new Set(['”', '」', '』', '’']);
const HARD_END = new Set(['。', '！', '？', '…']); // 句末标点（含省略号单字）
const SOFT = new Set(['，', '、']);                 // 次级断点：逗号/顿号
const SEMI = '；';

function isOpener(c, depth) { if (OPENER.has(c)) return true; return (c === '"' || c === "'") && depth <= 0; }
function isCloser(c, depth) { if (CLOSER.has(c)) return true; return (c === '"' || c === "'") && depth > 0; }

// 引号深度：扫描一段文本返回末尾深度（容忍未闭合/孤儿闭引号）
function quoteDepthAtEnd(s) {
  let d = 0;
  for (const ch of s) {
    if (isOpener(ch, d)) d++;
    else if (isCloser(ch, d)) d = Math.max(0, d - 1);
  }
  return d;
}

// ---------- 解码 ----------
function decode(buf) {
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return { text: new TextDecoder('utf-8').decode(buf), enc: 'utf-8(BOM)' };
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) return { text: new TextDecoder('utf-16le').decode(buf), enc: 'utf-16le(BOM)' };
  try { new TextDecoder('utf-8', { fatal: true }).decode(buf); return { text: new TextDecoder('utf-8').decode(buf), enc: 'utf-8' }; }
  catch { return { text: new TextDecoder('gb18030').decode(buf), enc: 'gb18030' }; }
}

// ---------- 分章 + 段落组装 ----------
const CH_TITLE = /^第[一二三四五六七八九十百千零两]+[章节回卷部篇]$/;
const SPECIAL_TITLES = new Set(['序章', '序言', '前言', '尾声', '后记', '译后记', '附录', '楔子', '引子']);
const MARKER = /^[　\s]*(?:[-—–_]?\s*\d+\s*[-—–_]?|[·•∙]?\s*\d+\s*[．.。]?|\d+\s*[．.。]?)[　\s]*$/; // 页码/校对标记行: -0- / ·120． / 12
const FOOTNOTE_LINE = /^[　\s]*\[(\d+)\][：:]?\s*(.*)$/;        // 注文定义行 [1]：…（按章收集）

function assemble(text) {
  const lines = text.split(/\r?\n/).map(l => l.replace(/\r$/, ''));
  const chapters = [];
  let cur = null;         // { title, paragraphs: [], notes: [] }
  let pending = '';       // 正在累积的段落文本
  let pendingOpen = false;// 该段落是否需要续行（引号未闭合 / 以逗号结尾）
  let dropped = { markers: 0, footnotes: 0 };

  const flush = () => {
    if (pending.trim()) {
      // 段落级清洗：剔除内联页码标记（OCR 把 ·218． 这类页码粘在句尾/句中）
      const clean = pending.trim().replace(/[·•∙]\s*\d+\s*[．.。]?/g, '').replace(/^[　\s]+/, '');
      if (clean) cur.paragraphs.push(clean);
    }
    pending = '';
    pendingOpen = false;
  };
  const pushChapter = title => { flush(); cur = { title, paragraphs: [], notes: [] }; chapters.push(cur); };

  for (const raw of lines) {
    const line = raw.replace(/^[　\s]+/, '').replace(/[　\s]+$/, '');
    if (!line) { flush(); continue; }                       // 空行 = 段落硬边界
    if (MARKER.test(line)) { dropped.markers++; continue; } // 页码标记直接剔除（不打断段落）
    if (FOOTNOTE_LINE.test(line)) {
      if (cur) {
        const m = line.match(FOOTNOTE_LINE);
        if (m && m[1]) cur.notes.push({ n: m[1], text: (m[2] || '').trim() });
      } else dropped.footnotes++;
      continue;
    }

    const title = line.trim();
    if (CH_TITLE.test(title) || SPECIAL_TITLES.has(title)) { pushChapter(title); continue; }

    // 续行判定：上一段落以未闭合引号结尾，或以逗号/顿号结尾 → 与本节拼接
    if (pendingOpen) {
      pending += line;
    } else {
      flush();
      pending = line;
    }
    const depth = quoteDepthAtEnd(pending);
    const last = [...pending].pop();
    pendingOpen = depth > 0 || last === '，' || last === '、';
  }
  flush();
  return { chapters, dropped };
}

// ---------- 断句 ----------
// 主切分：在句末标点(。！？…)后切，并把紧跟的后引号(”」』’)收进前一句
// 注意：允许在引号内切（引语中的多个句号各自成句）；不处理"引号内多句"的平衡，由统计暴露
function splitHard(p) {
  const units = [];
  let buf = '';
  let i = 0;
  const s = p;
  while (i < s.length) {
    const ch = s[i];
    buf += ch;
    if (HARD_END.has(ch)) {
      // 吸收连续句末标点
      while (i + 1 < s.length && HARD_END.has(s[i + 1])) { buf += s[i + 1]; i++; }
      // 吸收紧跟的后引号
      while (i + 1 < s.length && CLOSER.has(s[i + 1])) { buf += s[i + 1]; i++; }
      units.push(buf);
      buf = '';
    } else if (ch === '：' && CFG.attributionSplit && quoteDepthAtEnd(buf) === 0) {
      // 说话人标签式切分：冒号(可含空格)后紧跟引号 → 冒号结束当前单元
      let j = i + 1;
      while (j < s.length && /[\s　]/.test(s[j])) j++;
      if (j < s.length && (OPENER.has(s[j]) || isOpener(s[j], 0))) {
        units.push(buf);
        buf = '';
      }
    }
    i++;
  }
  if (buf.trim()) units.push(buf);
  return units;
}

// 分号切分：; 后紧跟引号时不切（OCR 的 回答说；“ 场景）
function splitSemi(u) {
  const out = [];
  let buf = '';
  for (let i = 0; i < u.length; i++) {
    const ch = u[i];
    buf += ch;
    if (ch === SEMI) {
      const nxt = u[i + 1];
      if (nxt !== undefined && !(isOpener(nxt, 0) || OPENER.has(nxt))) { out.push(buf); buf = ''; }
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}

// 是否为安全软切点（引号外；冒号/分号后不跟引号）
function softCutOK(chars, i, d) {
  if (d !== 0) return false;
  const ch = chars[i];
  const nxt = chars[i + 1];
  if (SOFT.has(ch)) return true;
  if (ch === SEMI) return !!nxt && !OPENER.has(nxt) && !isOpener(nxt, 0);
  if (ch === '：') return !!nxt && !(OPENER.has(nxt) || isOpener(nxt, 0));
  return false;
}

// 超长句软切分：从头部贪心切，每块 ≤ 阈值；
// 只在"引号外"的逗号/顿号/分号/冒号处切（避免悬空引号碎片）；冒号后紧跟引号不切（他说：“…”保持整体）
function splitLong(u) {
  const need = [...u].length;
  if (need <= CFG.longThreshold) return [u];
  const parts = [];
  let rest = u;
  for (;;) {
    const chars = [...rest];
    const L = chars.length;
    if (L <= CFG.longThreshold) break;
    // 窗口：切点 i 使左片长度 i+1 落在 [minFrag, threshold]
    const lo = CFG.minFrag - 1;
    const hi = Math.min(CFG.longThreshold - 1, L - 1 - CFG.minFrag);
    if (lo > hi) break;
    let d = 0, cutAt = -1;
    for (let i = 0; i <= hi; i++) {
      const ch = chars[i];
      if (isOpener(ch, d)) d++;
      else if (isCloser(ch, d)) d = Math.max(0, d - 1);
      if (i >= lo && softCutOK(chars, i, d)) cutAt = i;   // 尽量取窗口内最靠后的安全切点
    }
    if (cutAt < 0) {
      // 回退：窗口内无切点，全段找第一个安全切点（罕见巨型段），避免整段保留
      d = 0;
      for (let i = lo; i < L - 1; i++) {
        const ch = chars[i];
        if (isOpener(ch, d)) d++;
        else if (isCloser(ch, d)) d = Math.max(0, d - 1);
        if (i >= CFG.minFrag - 1 && softCutOK(chars, i, d)) { cutAt = i; break; }
      }
      if (cutAt < 0) break;             // 全段无安全切点 → 保持整体
    }
    parts.push(chars.slice(0, cutAt + 1).join(''));
    rest = chars.slice(cutAt + 1).join('');
  }
  parts.push(rest);
  return parts;
}

function splitParagraph(p) {
  const hard = splitHard(p);
  const units = [];
  for (const u of hard) {
    for (const s of CFG.semicolonSplit ? splitSemi(u) : [u]) {
      for (const t of splitLong(s)) if (t.trim()) units.push(t.trim());
    }
  }
  return units;
}

// ---------- 统计与输出 ----------
function main() {
  const { text, enc } = decode(readFileSync(srcFile));
  const { chapters, dropped } = assemble(text);

  let totalUnits = 0, totalChars = 0, maxLen = 0;
  const lens = [];
  let quoteInside = 0;      // 以未闭合引号结尾的单元数（引号内硬切产生）
  let frag3 = 0;            // 长度 < 3 的碎片
  let overTh = 0;           // 超过阈值且未能切分的单元
  let over120 = 0;
  const longest = [];       // 最长单元（审计）
  const orphanEnd = [];     // 以未闭合引号结尾的单元样例
  const samples = [];
  let contEnd = 0, orphanStart = 0;
  let globalIdx = 0;

  const book = [];
  for (const ch of chapters) {
    const c = { title: ch.title, paras: ch.paragraphs.length, notes: ch.notes || [], units: [] };
    for (const p of ch.paragraphs) {
      const us = splitParagraph(p);
      us.forEach((u, idx) => {
        const len = [...u].length;
        lens.push(len);
        totalChars += len;
        totalUnits++;
        maxLen = Math.max(maxLen, len);
        if (len > CFG.longThreshold) overTh++;
        if (len > 120) over120++;
        if (len < 3) frag3++;
        const dEnd = quoteDepthAtEnd(u);
        if (dEnd > 0) quoteInside++;
        const lastCh = [...u].pop();
        const firstCh = [...u][0];
        if (lastCh === '，' || lastCh === '、' || lastCh === SEMI || lastCh === '：') contEnd++;
        if (CLOSER.has(firstCh)) orphanStart++;
        if (longest.length < 25 || len > longest[longest.length - 1]?.len) {
          longest.push({ len, ch: ch.title, idx: globalIdx, head: u.slice(0, 80) });
          longest.sort((a, b) => b.len - a.len);
          if (longest.length > 25) longest.pop();
        }
        if (dEnd > 0 && orphanEnd.length < 12) orphanEnd.push({ ch: ch.title, idx: globalIdx, text: u.slice(0, 70) });
        c.units.push({ t: u, p: idx === 0 });
        globalIdx++;
      });
    }
    book.push(c);
  }

  lens.sort((a, b) => a - b);
  const pct = q => lens[Math.min(lens.length - 1, Math.floor(lens.length * q))];
  const sum = lens.reduce((a, b) => a + b, 0);

  const R = [];
  const log = (s = '') => R.push(String(s));
  log('════════ 断句统计报告 ════════');
  log(`源文件: ${srcFile}`);
  log(`编码: ${enc}   总字符: ${text.length}`);
  log(`章节数: ${chapters.length}（含"序章"）   剔除页码标记行: ${dropped.markers}   剔除脚注行: ${dropped.footnotes}`);
  log('');
  log(`总句数(单元): ${totalUnits}   总字数: ${totalChars}`);
  log(`句长分布: min=${lens[0]}  p10=${pct(0.1)}  p25=${pct(0.25)}  中位=${pct(0.5)}  p75=${pct(0.75)}  p90=${pct(0.9)}  p95=${pct(0.95)}  max=${maxLen}`);
  log(`平均句长: ${(sum / lens.length).toFixed(1)} 字`);
  log(`>${CFG.longThreshold}字未能再切的单元: ${overTh} (${(overTh / totalUnits * 100).toFixed(2)}%)`);
  log(`>120字的超长单元: ${over120}`);
  log(`<3字的碎片: ${frag3}`);
  log(`以未闭合引号结尾的单元(引号内硬切/丢引号): ${quoteInside}`);
  log(`以逗号/顿号/分号/冒号结尾的续行单元: ${contEnd} (${(contEnd / totalUnits * 100).toFixed(2)}%)`);
  log(`以闭引号开头的孤儿单元: ${orphanStart}`);
  log('');
  log('── 审计 A：最长单元 Top 15 ──');
  for (const m of longest.slice(0, 15)) log(`[${m.ch}#${m.idx}] ${m.len}字: ${m.head}…`);
  log('');
  if (orphanEnd.length) {
    log('── 审计 B：以未闭合引号结尾的单元样例（前 12） ──');
    for (const m of orphanEnd) log(`[${m.ch}#${m.idx}] ${m.text}…`);
    log('');
  }
  log('── 章节一览 ──');
  for (const c of book) {
    const chChars = c.units.reduce((a, u) => a + [...u.t].length, 0);
    log(`${c.title.padEnd(5)} 段落=${String(c.paras).padStart(4)} 句=${String(c.units.length).padStart(5)} 字=${chChars}`);
  }
  log('');
  log('── 抽样预览（每章首段前 3 句 / 全局抽样段落） ──');
  const pickChapters = [1, 3, 6, 10, 14, 19, 20];
  for (const ci of pickChapters) {
    if (!book[ci]) continue;
    const c = book[ci];
    const firstParaUnits = c.units.filter(u => u.p).slice(0, 3);
    log(`\n[${c.title}] 开头:`);
    for (const u of firstParaUnits) log(`  · ${u.t}`);
    // 另抽本册中间一个段落的连续 6 句
    const midIdx = Math.floor(c.units.length / 2);
    log(`  中部(句 ${midIdx} 起):`);
    for (const u of c.units.slice(midIdx, midIdx + 6)) log(`  · ${u.t}`);
  }

  writeFileSync(resolve(outDir, 'split-report.txt'), R.join('\n'), 'utf8');
  writeFileSync(resolve(outDir, 'book.sentences.json'), JSON.stringify(book), 'utf8');
  console.log(`完成: 共 ${totalUnits} 句 / ${chapters.length} 章 → ${resolve(outDir, 'split-report.txt')}`);
  console.log(`句子流 JSON → ${resolve(outDir, 'book.sentences.json')} (${(JSON.stringify(book).length / 1024 / 1024).toFixed(2)} MB)`);
}

main();
