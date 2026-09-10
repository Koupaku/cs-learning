// 背景系统：程序化绘制（Canvas）+ 主题色板（内置风格包）+ 本地图片模式
// 画一次/页：垂直渐变 + 光斑 + 暗角；页面切换由 CSS 淡入动画承担（Reader 层 key 重挂载）

export interface Palette {
  name: string;
  top: string;
  bottom: string;
  glows: { color: string; x: number; y: number; r: number; a: number }[];
  vignette: number; // 0-1 暗角强度
}

export const PALETTES: Palette[] = [
  { name: '墨夜', top: '#1b2430', bottom: '#07090d', glows: [{ color: '#3a5a7a', x: 0.7, y: 0.2, r: 0.5, a: 0.25 }], vignette: 0.5 },
  { name: '青瓷', top: '#17323a', bottom: '#05090c', glows: [{ color: '#2f7d74', x: 0.25, y: 0.35, r: 0.6, a: 0.18 }, { color: '#3f5d86', x: 0.8, y: 0.7, r: 0.5, a: 0.12 }], vignette: 0.45 },
  { name: '鎏金', top: '#33291c', bottom: '#0b0805', glows: [{ color: '#a9763b', x: 0.6, y: 0.15, r: 0.45, a: 0.2 }, { color: '#6b4a22', x: 0.2, y: 0.8, r: 0.55, a: 0.15 }], vignette: 0.55 },
  { name: '雪原', top: '#2c3138', bottom: '#0b0d10', glows: [{ color: '#b7c4cf', x: 0.5, y: 0.12, r: 0.6, a: 0.1 }], vignette: 0.5 },
  { name: '苔原', top: '#1d2b20', bottom: '#060a07', glows: [{ color: '#5d7a4a', x: 0.3, y: 0.6, r: 0.55, a: 0.15 }, { color: '#2f4a3a', x: 0.85, y: 0.25, r: 0.5, a: 0.12 }], vignette: 0.5 },
  { name: '绛紫', top: '#2b1f33', bottom: '#0a070d', glows: [{ color: '#7a4a8f', x: 0.7, y: 0.3, r: 0.5, a: 0.16 }, { color: '#4a2f63', x: 0.15, y: 0.75, r: 0.55, a: 0.12 }], vignette: 0.55 },
  { name: '赤砂', top: '#3a2418', bottom: '#0c0705', glows: [{ color: '#a05a30', x: 0.5, y: 0.7, r: 0.55, a: 0.16 }], vignette: 0.55 },
  { name: '夜航', top: '#12263a', bottom: '#04080e', glows: [{ color: '#3f7fa0', x: 0.75, y: 0.4, r: 0.5, a: 0.2 }, { color: '#7a9fbf', x: 0.35, y: 0.1, r: 0.3, a: 0.14 }], vignette: 0.5 },
];

// 确定性伪随机
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function paintBackground(canvas: HTMLCanvasElement, palette: Palette, seed: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // 垂直渐变底
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, palette.top);
  g.addColorStop(1, palette.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 光斑（径向渐变）
  const rnd = mulberry32(seed);
  const blobs = palette.glows.map((gl) => ({ ...gl, jx: (rnd() - 0.5) * 0.12, jy: (rnd() - 0.5) * 0.12 }));
  for (const gl of blobs) {
    const cx = gl.x * w + gl.jx * w;
    const cy = gl.y * h + gl.jy * h;
    const r = gl.r * Math.max(w, h);
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const c = hexToRgb(gl.color);
    rg.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${gl.a})`);
    rg.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }

  // 细噪点（增加质感，淡化渐变条带感）
  const n = Math.floor((w * h) / 9000);
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let i = 0; i < n; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, 1, 1);
  }

  // 暗角
  const vg = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.42, w / 2, h * 0.55, Math.max(w, h) * 0.85);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(0,0,0,${palette.vignette})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// 取某页的主题
export function paletteFor(bgKey: number, mode: 'procedural' | 'themed'): Palette {
  if (mode === 'themed') return PALETTES[bgKey % PALETTES.length];
  const rnd = mulberry32(bgKey * 7919 + 13);
  return PALETTES[Math.floor(rnd() * PALETTES.length)];
}
