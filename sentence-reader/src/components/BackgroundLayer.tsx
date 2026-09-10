// 背景层：程序化/主题画布 | 本地图片 | 关闭
import { useEffect, useMemo, useRef } from 'react';
import { paintBackground, paletteFor } from '../bg';
import type { BgMode } from '../types';

interface Props {
  mode: BgMode;
  bgKey: number; // 翻页/换章时 +1 → 背景切换
  strength: number; // 0-100
  images: string[]; // objectURL 列表（mode=images）
  viewport: { w: number; h: number };
}

export default function BackgroundLayer({ mode, bgKey, strength, images, viewport }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 程序化 / 主题：按 bgKey 重绘
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || mode === 'off' || mode === 'images') return;
    const palette = paletteFor(bgKey, mode);
    paintBackground(cv, palette, bgKey * 131 + 7);
  }, [bgKey, mode, viewport.w, viewport.h]);

  const imgSrc = useMemo(() => {
    if (mode !== 'images' || images.length === 0) return null;
    return images[((bgKey % images.length) + images.length) % images.length];
  }, [mode, images, bgKey]);

  // 预加载下一张本地图
  useEffect(() => {
    if (mode !== 'images' || images.length === 0) return;
    const next = images[((bgKey + 1) % images.length + images.length) % images.length];
    if (next) new Image().src = next;
  }, [mode, images, bgKey]);

  if (mode === 'off' || strength <= 0) return null;

  return (
    <div className="bg-layer" style={{ opacity: strength / 100 }}>
      <div className="bg-fade" key={bgKey}>
        {mode === 'images' && imgSrc ? (
          <img className="bg-img" src={imgSrc} alt="" draggable={false} />
        ) : (
          <canvas ref={canvasRef} className="bg-canvas" />
        )}
        <div className="bg-scrim" />
        <div className="bg-bottom" />
      </div>
    </div>
  );
}
