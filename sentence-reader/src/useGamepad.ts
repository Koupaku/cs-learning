// 手柄输入（Gamepad API）：边沿触发，轮询仅在检测到手柄时运行
import { useEffect, useRef } from 'react';

export type GAction = 'advance' | 'back' | 'backPage' | 'nextChapter' | 'menu';

// 标准映射：A=0 B=1 X=2 Y=3 LB=4 RB=5 Start=9 Select=8；十字键 12-15
const MAP: Record<number, GAction> = {
  0: 'advance',
  1: 'back',
  4: 'backPage',
  5: 'nextChapter',
  9: 'menu',
  12: 'back',
  13: 'advance',
  14: 'backPage',
  15: 'nextChapter',
};

export function useGamepad(onAction: (a: GAction) => void, active: boolean) {
  const cbRef = useRef(onAction);
  cbRef.current = onAction;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let prev = new Map<number, boolean[]>();
    let hasGamepad = false;

    const tick = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      let saw = false;
      for (const pad of pads) {
        if (!pad) continue;
        saw = true;
        if (!prev.has(pad.index)) prev.set(pad.index, pad.buttons.map(() => false));
        const old = prev.get(pad.index)!;
        pad.buttons.forEach((b, i) => {
          const pressed = typeof b === 'object' ? b.pressed : b > 0.5;
          if (pressed && !old[i] && MAP[i]) cbRef.current(MAP[i]);
          old[i] = pressed;
        });
      }
      hasGamepad = saw;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
