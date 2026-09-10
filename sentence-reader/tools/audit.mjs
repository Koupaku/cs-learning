// tools/audit.mjs — 肉眼错率审计：随机抽段落，渲染为 单元│单元│… 供人工判切点
// 用法: node tools/audit.mjs   → out/audit-sample.txt
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const book = JSON.parse(readFileSync(resolve(HERE, 'out', 'book.sentences.json'), 'utf8'));

// 确定性伪随机（种子固定，结果可复现）
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(20260214);

// 重组段落（unit.p === true 为段首）
const paras = [];
for (const ch of book) {
  let cur = [];
  for (const u of ch.units) {
    if (u.p && cur.length) { paras.push({ ch: ch.title, units: cur }); cur = []; }
    cur.push(u.t);
  }
  if (cur.length) paras.push({ ch: ch.title, units: cur });
}

// 分层抽样：每章抽 2 段（序章与小说主体各覆盖）
const byChapter = new Map();
for (const p of paras) { if (!byChapter.has(p.ch)) byChapter.set(p.ch, []); byChapter.get(p.ch).push(p); }

const chosen = [];
const chapOrder = [...byChapter.keys()];
for (const ch of chapOrder) {
  const list = byChapter.get(ch);
  if (!list.length) continue;
  const n = ch === '序章' ? 1 : 2;
  for (let k = 0; k < Math.min(n, list.length); k++) {
    chosen.push(list[Math.floor(rnd() * list.length)]);
  }
}

const R = [];
R.push('══ 审计抽样（每章取段，' + chosen.length + ' 段 / ' + paras.length + ' 段） ══');
R.push('判读标准：│ 处切点应"读起来顺"；若出现①同句被腰斩到语义断裂 ②两句粘连 ③悬空引号开头/孤零零的标点碎片 ④明显该切未切 → 记一次错误');
R.push('');
chosen.forEach((p, i) => {
  R.push(`── [${p.ch}] 抽样段 #${i}（${p.units.length} 单元）──`);
  let line = '';
  p.units.forEach((u, idx) => { line += (idx ? ' │ ' : '') + u; });
  R.push(line);
  R.push('');
});
writeFileSync(resolve(HERE, 'out', 'audit-sample.txt'), R.join('\n'), 'utf8');
console.log(`抽样审计 → out/audit-sample.txt (${chosen.length} 段)`);
