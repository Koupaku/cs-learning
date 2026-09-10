// tools/probe.mjs — 文本结构探针：编码检测 + 排版特征统计
// 用法: node tools/probe.mjs <文件路径>   -> 输出 UTF-8 报告到 stdout（重定向到文件）
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const buf = readFileSync(file);
const out = [];
const log = (s = '') => out.push(String(s));

log(`文件大小: ${buf.length} bytes`);
log(`前 3 字节(hex): ${[...buf.slice(0, 3)].map(b => b.toString(16).padStart(2, '0')).join(' ')}`);

// 1) BOM 检测
let enc = null;
if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) enc = 'utf-8 (BOM)';
else if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) enc = 'utf-16le (BOM)';
else if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) enc = 'utf-16be (BOM)';

// 2) 尝试 utf-8 严格解码
let text = null;
if (!enc) {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buf);
    enc = 'utf-8 (无 BOM，严格解码通过)';
  } catch {
    enc = null;
  }
}
if (enc?.startsWith('utf-8')) text = new TextDecoder('utf-8').decode(buf);

// 3) 非 utf-8 → gb18030
if (!text) {
  try {
    text = new TextDecoder('gb18030').decode(buf);
    enc = (enc ? enc + ' → 实际按 gb18030 解码' : 'gb18030（未检测到 UTF-8，按 GBK 系解码）');
  } catch (e) {
    log('gb18030 解码失败: ' + e.message);
    process.exit(1);
  }
}

log(`检测编码: ${enc}`);
log(`解码后字符数: ${text.length}`);

// 替换字符统计（若 gb18030 猜错会大量出现 U+FFFD）
const replCount = (text.match(/\uFFFD/g) || []).length;
log(`U+FFFD 替换字符数: ${replCount}（应接近 0）`);

// 4) 行结构
const lines = text.split(/\r?\n/);
const crlf = text.includes('\r\n') ? text.match(/\r\n/g).length : 0;
log(`总行数: ${lines.length}（CRLF 行: ${crlf}, LF 行: ${lines.length - (text.endsWith('\n') ? 1 : 0) - crlf}）`);

// 空行统计
let blank = 0, nonBlank = [];
for (const l of lines) { if (l.trim() === '') blank++; else nonBlank.push(l); }
log(`空行数: ${blank}, 非空行数: ${nonBlank.length}`);

// 5) 行长分布（非空行）
const lens = nonBlank.map(l => [...l].length);
lens.sort((a, b) => a - b);
const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
log(`非空行长度: min=${lens[0]} p25=${lens[Math.floor(lens.length * 0.25)]} 中位=${lens[Math.floor(lens.length * 0.5)]} p75=${lens[Math.floor(lens.length * 0.75)]} max=${lens[lens.length - 1]} avg=${avg.toFixed(1)}`);

// 6) 常见行内硬换行特征：是否"一行即一段"（无缩进、行首无空格）
let noIndent = 0, withIndent = 0;
for (const l of nonBlank) {
  if (/^[\s　]/.test(l)) withIndent++; else noIndent++;
}
log(`非空行中: 行首空白(缩进)=${withIndent}, 无缩进=${noIndent}`);

// 7) 章节标题候选
const chPatterns = [
  ['第X章(1-9数字)', /^第[0-9０-９]+章/],
  ['第X章(汉字数字)', /^第[一二三四五六七八九十百千零两]+章/],
  ['第X节/回/卷', /^第[一二三四五六七八九十百千零两0-9０-９]+[节回卷部集]/],
  ['"Chapter"式', /^Chapter\s+\d+/i],
];
log('\n--- 章节标题候选统计（行首） ---');
for (const [name, re] of chPatterns) {
  const hits = nonBlank.filter(l => re.test(l.trim()));
  log(`${name}: ${hits.length} 处  例: ${hits.slice(0, 3).map(h => h.trim().slice(0, 30)).join(' | ')}`);
}

// 8) 对话引号特征
log('\n--- 引号与破折号特征 ---');
const count = s => (text.match(new RegExp(s, 'g')) || []).length;
log(`中文弯引号 “: ${count('“')}  ”: ${count('”')}`);
log(`直角引号 「: ${count('「')}  」: ${count('」')}`);
log(`英文直引号 ": ${count('"')}`);
log(`破折号 ——: ${count('——')}`);
log(`省略号 ……: ${count('……')}  …: ${count('…')}`);

// 9) 对话行样式：行首为 “ 或 —— 的行数（若为硬换行全文，这些是"对话单独成行"的信号）
let dl = 0, dd = 0;
for (const l of nonBlank) {
  const t = l.trim();
  if (/^[“「『]/.test(t)) dl++;
  else if (/^——/.test(t)) dd++;
}
log(`行首为引号的行: ${dl}, 行首为——的行: ${dd}`);

// 10) 文本开头 40 个非空行（前 60 原始行）
log('\n--- 原始文本前 60 行（带行号） ---');
for (let i = 0; i < Math.min(60, lines.length); i++) {
  log(String(i + 1).padStart(4) + '| ' + lines[i]);
}

process.stdout.write(out.join('\n'));
