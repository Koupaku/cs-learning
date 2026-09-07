// ===== utils.js —— 这个文件只管"小工具函数" =====
// import = "把别家 export 的东西拿进来用"
// import { 名字 } from '相对路径' —— 注意：
//   1. 名字必须和 export 时一模一样（{ weatherMap }）
//   2. 路径必须带 ./ 开头，且 .js 后缀不能省
import { weatherMap } from './data.js';
import { cities } from './data.js';
// 命名导出函数
export function getEmoji(code) {
  return weatherMap[code] ?? '❓';
}

export function buildUrl(city) {
  const { lat, lon } = cities;   // ❌ 注意！这里没 import cities —— 会报错吗？
  return '';
}
// 上面那行是故意写的错误示范：没用到的别 import，要用到的必须 import。
// 想用 cities 就在文件顶部加：import { cities } from './data.js';
