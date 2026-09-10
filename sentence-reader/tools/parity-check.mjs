// tools/parity-check.mjs — 校验浏览器版 splitCore 与 tools/split.mjs 产物逐字节一致
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBook, decodeText } from '../src/text/splitCore.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '..', '【名著】《百年孤独》（校对全本）作者：加西亚·马尔克斯_著_黄锦炎译.txt');
const EXPECT = resolve(HERE, 'out', 'book.sentences.json');

const buf = readFileSync(SRC).buffer.slice(readFileSync(SRC).byteOffset, readFileSync(SRC).byteOffset + readFileSync(SRC).byteLength);
const { text, enc } = decodeText(buf);
const got = buildBook(text);
const want = JSON.parse(readFileSync(EXPECT, 'utf8'));

let ok = true;
if (got.length !== want.length) { console.log(`章节数不符: ${got.length} vs ${want.length}`); ok = false; }
else {
  for (let i = 0; i < want.length; i++) {
    if (got[i].title !== want[i].title) { console.log(`第${i}章标题不符`); ok = false; break; }
    if (JSON.stringify(got[i].notes ?? []) !== JSON.stringify(want[i].notes ?? [])) {
      console.log(`[${want[i].title}] 注文不符`); ok = false; break;
    }
    if (got[i].units.length !== want[i].units.length) {
      console.log(`[${want[i].title}] 单元数不符: ${got[i].units.length} vs ${want[i].units.length}`); ok = false; break;
    }
    for (let j = 0; j < want[i].units.length; j++) {
      const a = got[i].units[j], b = want[i].units[j];
      if (a.t !== b.t || a.p !== b.p) {
        console.log(`[${want[i].title}] 单元#${j} 不一致:`);
        console.log('  got:', JSON.stringify(a));
        console.log('  want:', JSON.stringify(b));
        ok = false; break;
      }
    }
    if (!ok) break;
  }
}
const total = got.reduce((a, c) => a + c.units.length, 0);
console.log(ok ? `✓ 一致性通过: ${got.length} 章 / ${total} 句（编码 ${enc}）与 tools/out/book.sentences.json 完全一致` : '✗ 不一致');
process.exit(ok ? 0 : 1);
