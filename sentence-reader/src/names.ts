// 人名标注词表（按书）。百年孤独内置词表覆盖主要人名及其 OCR 分隔符变体（· / ' / ‘）。
// 匹配按"最长优先"在渲染时执行，避免短名把长名拆花。
const BAINIAN = [
  '霍塞·阿卡迪奥·布恩地亚',
  "霍塞·阿卡迪奥'布恩地亚",
  '霍塞·阿卡迪奥第二',
  '霍塞·阿卡迪奥',
  '奥雷良诺·布恩地亚',
  '奥雷良诺·霍塞',
  '奥雷良诺第二',
  '奥雷良诺·特里斯特',
  '奥雷良诺·森特诺',
  '奥雷良诺',
  '阿玛兰塔·乌苏拉',
  '阿玛兰塔',
  '阿卡迪奥',
  '乌苏拉·伊瓜朗',
  '乌苏拉',
  '雷蓓卡',
  '雷梅苔丝',
  '菲南达·德·卡庇奥',
  '菲南达',
  '梅梅',
  '墨尔基阿德斯',
  '庇拉·特内拉',
  '皮埃特罗·克雷斯庇',
  "皮埃特罗'克雷斯庇",
  '佩特拉·科特',
  '圣塔索菲娅·德·拉·佩达',
  '马乌里肖·巴比洛尼亚',
  '加斯东',
  '加夫列尔·加西亚·马尔克斯',
  '加西亚·马尔克斯',
  '维茜塔肖恩',
  '堂阿波利纳尔·莫科特',
  '普罗登肖·阿基拉尔',
  '卡梅莉塔·蒙梯埃尔',
  '尼卡诺尔·雷依纳',
  '赫伯特',
  '好汉弗朗西斯科',
  '弗朗西斯科',
  '克雷斯庇',
  '布恩地亚',
];

const CACHE = new Map<string, RegExp | null>();

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function nameRegex(bookId: string): RegExp | null {
  if (CACHE.has(bookId)) return CACHE.get(bookId)!;
  const list = bookId === 'bainian' ? BAINIAN : [];
  if (list.length === 0) {
    CACHE.set(bookId, null);
    return null;
  }
  // 最长优先；整体保持顺序
  const sorted = [...list].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${sorted.map(esc).join('|')})`, 'g');
  CACHE.set(bookId, re);
  return re;
}
