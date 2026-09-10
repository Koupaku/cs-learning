// src/text/splitCore.js — 断句管线（浏览器可用，纯函数，与 tools/split.mjs 逻辑一致）
// 输入：解码后的全文文本 → 输出：[{ title, units: [{t, p}] }]（章节 → 单元流；p=段首标记）
// 供阅读器直接消费；被 tools/parity-check.mjs 用于与 Node 版产物做一致性校验。

export const CFG = {
  longThreshold: 72,       // 超长句切分阈值（字）
  minFrag: 8,              // 软切分后的最小碎片长度
  semicolonSplit: true,    // 分号作为句界（规则5）
  attributionSplit: true,  // 说话人标签式切分：他说：|“……”（§13#1 拍板）
};

const OPENER = new Set(['“', '「', '『', '‘']);
const CLOSER = new Set(['”', '」', '』', '’']);
const HARD_END = new Set(['。', '！', '？', '…']);
const SOFT = new Set(['，', '、']);
const SEMI = '；';

function isOpener(c, depth) { if (OPENER.has(c)) return true; return (c === '"' || c === "'") && depth <= 0; }
function isCloser(c, depth) { if (CLOSER.has(c)) return true; return (c === '"' || c === "'") && depth > 0; }

export function quoteDepthAtEnd(s) {
  let d = 0;
  for (const ch of s) {
    if (isOpener(ch, d)) d++;
    else if (isCloser(ch, d)) d = Math.max(0, d - 1);
  }
  return d;
}

// ---------- 解码（浏览器） ----------
export function decodeText(buf) {
  // buf: ArrayBuffer
  const bytes = new Uint8Array(buf);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
    return { text: new TextDecoder('utf-8').decode(bytes), enc: 'utf-8(BOM)' };
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe)
    return { text: new TextDecoder('utf-16le').decode(bytes), enc: 'utf-16le(BOM)' };
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { text: new TextDecoder('utf-8').decode(bytes), enc: 'utf-8' };
  } catch {
    // GBK 系（GB18030 为超集）；浏览器 TextDecoder 均支持
    try { return { text: new TextDecoder('gb18030').decode(bytes), enc: 'gb18030' }; }
    catch { return { text: new TextDecoder('windows-1252').decode(bytes), enc: 'fallback' }; }
  }
}

// ---------- 分章 + 段落组装 ----------
const CH_TITLE = /^第[一二三四五六七八九十百千零两]+[章节回卷部篇]$/;
const SPECIAL_TITLES = new Set(['序章', '序言', '前言', '尾声', '后记', '译后记', '附录', '楔子', '引子']);
const MARKER = /^[　\s]*(?:[-—–_]?\s*\d+\s*[-—–_]?|[·•∙]?\s*\d+\s*[．.。]?|\d+\s*[．.。]?)[　\s]*$/;
const FOOTNOTE_LINE = /^[　\s]*\[(\d+)\][：:]?\s*(.*)$/; // 注文定义行：[1]：xxx（按章收集，不再丢弃）

export function assemble(text) {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\r$/, ''));
  const chapters = [];
  let cur = null;
  let pending = '';
  let pendingOpen = false;
  const dropped = { markers: 0, footnotes: 0 };

  const flush = () => {
    if (pending.trim()) {
      const clean = pending.trim().replace(/[·•∙]\s*\d+\s*[．.。]?/g, '').replace(/^[　\s]+/, '');
      if (clean) cur.paragraphs.push(clean);
    }
    pending = '';
    pendingOpen = false;
  };
  const pushChapter = (title) => { flush(); cur = { title, paragraphs: [], notes: [] }; chapters.push(cur); };

  for (const raw of lines) {
    const line = raw.replace(/^[　\s]+/, '').replace(/[　\s]+$/, '');
    if (!line) { flush(); continue; }
    if (MARKER.test(line)) { dropped.markers++; continue; }
    if (FOOTNOTE_LINE.test(line)) {
      if (cur) {
        const m = line.match(FOOTNOTE_LINE);
        if (m && m[1]) cur.notes.push({ n: m[1], text: (m[2] || '').trim() });
      } else dropped.footnotes++;
      continue;
    }
    const title = line.trim();
    if (CH_TITLE.test(title) || SPECIAL_TITLES.has(title)) { pushChapter(title); continue; }
    if (pendingOpen) pending += line;
    else { flush(); pending = line; }
    const depth = quoteDepthAtEnd(pending);
    const last = [...pending].pop();
    pendingOpen = depth > 0 || last === '，' || last === '、';
  }
  flush();
  return { chapters, dropped };
}

// ---------- 断句 ----------
function splitHard(p) {
  const units = [];
  let buf = '';
  let i = 0;
  const s = p;
  while (i < s.length) {
    const ch = s[i];
    buf += ch;
    if (HARD_END.has(ch)) {
      while (i + 1 < s.length && HARD_END.has(s[i + 1])) { buf += s[i + 1]; i++; }
      while (i + 1 < s.length && CLOSER.has(s[i + 1])) { buf += s[i + 1]; i++; }
      units.push(buf);
      buf = '';
    } else if (ch === '：' && CFG.attributionSplit && quoteDepthAtEnd(buf) === 0) {
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

function softCutOK(chars, i, d) {
  if (d !== 0) return false;
  const ch = chars[i];
  const nxt = chars[i + 1];
  if (SOFT.has(ch)) return true;
  if (ch === SEMI) return !!nxt && !OPENER.has(nxt) && !isOpener(nxt, 0);
  if (ch === '：') return !!nxt && !(OPENER.has(nxt) || isOpener(nxt, 0));
  return false;
}

function splitLong(u) {
  const need = [...u].length;
  if (need <= CFG.longThreshold) return [u];
  const parts = [];
  let rest = u;
  for (;;) {
    const chars = [...rest];
    const L = chars.length;
    if (L <= CFG.longThreshold) break;
    const lo = CFG.minFrag - 1;
    const hi = Math.min(CFG.longThreshold - 1, L - 1 - CFG.minFrag);
    if (lo > hi) break;
    let d = 0, cutAt = -1;
    for (let i = 0; i <= hi; i++) {
      const ch = chars[i];
      if (isOpener(ch, d)) d++;
      else if (isCloser(ch, d)) d = Math.max(0, d - 1);
      if (i >= lo && softCutOK(chars, i, d)) cutAt = i;
    }
    if (cutAt < 0) {
      d = 0;
      for (let i = lo; i < L - 1; i++) {
        const ch = chars[i];
        if (isOpener(ch, d)) d++;
        else if (isCloser(ch, d)) d = Math.max(0, d - 1);
        if (i >= CFG.minFrag - 1 && softCutOK(chars, i, d)) { cutAt = i; break; }
      }
      if (cutAt < 0) break;
    }
    parts.push(chars.slice(0, cutAt + 1).join(''));
    rest = chars.slice(cutAt + 1).join('');
  }
  parts.push(rest);
  return parts;
}

export function splitParagraph(p) {
  const hard = splitHard(p);
  const units = [];
  for (const u of hard) {
    for (const s of CFG.semicolonSplit ? splitSemi(u) : [u]) {
      for (const t of splitLong(s)) if (t.trim()) units.push(t.trim());
    }
  }
  return units;
}

// ---------- 全流程：全文 → 章节单元流 ----------
export function buildBook(text) {
  const { chapters } = assemble(text);
  return chapters.map((ch) => ({
    title: ch.title,
    notes: ch.notes || [],
    units: ch.paragraphs.flatMap((p) => {
      const us = splitParagraph(p);
      return us.map((t, idx) => ({ t, p: idx === 0 }));
    }),
  }));
}
