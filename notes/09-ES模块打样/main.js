// ===== main.js —— 入口文件：把零件组装起来 =====
// 每个文件开头，先想清楚：我要用什么？（import）
import { cities, weatherMap } from './data.js';
import { getEmoji, buildUrl } from './utils.js';

console.log('data.js 的 cities：', cities);
console.log('北京坐标：', cities['北京']);
console.log('天气代码 0 的 emoji：', getEmoji(0));

// 试试 import 的名字拼错会发生什么：
// import { citiesX } from './data.js';   ← 删掉注释试一次，看 Console 报错长什么样
// 报错是"模块系统"在保护你：名字写错立刻告诉你，而不是静默 undefined！

console.log('模块全家桶演示完毕：数据在 data.js，工具在 utils.js，组装在 main.js');
