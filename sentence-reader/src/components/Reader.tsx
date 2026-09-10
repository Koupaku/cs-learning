// 阅读器：逐句推进 / 数学翻页 / 回退 / 章节衔接 / 段落停顿 / 注文与人名标注 / 输入层
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Book, Progress, Settings, Unit } from '../types';
import { useGamepad, type GAction } from '../useGamepad';
import { nameRegex } from '../names';
import BackgroundLayer from './BackgroundLayer';
import Drawer from './Drawer';

interface Props {
  book: Book;
  init: Progress;
  settings: Settings;
  onSettings: (s: Settings) => void;
  onProgress: (p: Progress) => void;
  onExit: () => void;
}

// ============ 排版度量（数学翻页；文本框模型） ============
const BOX_MAX_W = 980;   // 文本框最大宽
const BOX_MARGIN = 12;   // 文本框上下留白
const BOX_PAD_X = 34;    // 文本框内左右内边距
const BOX_PAD_Y = 20;    // 文本框内上下内边距
const FULLW = /[^\x00-\x7f]/; // CJK 与全角标点按 1 字宽，ASCII 按 0.55
function estWidth(s: string) {
  let w = 0;
  for (const ch of s) w += FULLW.test(ch) ? 1 : 0.55;
  return w;
}
function lineCount(text: string, charsPerLine: number) {
  if (!text) return 1;
  return Math.max(1, Math.ceil(estWidth(text) / Math.max(1, charsPerLine)));
}

// 页面 = 从光标向前打包的"最长可容纳后缀"（heights 为每单元行数，含注文附加行）
function pageRange(heights: number[], cursor: number, capLines: number): { s: number; overflow: boolean } {
  if (cursor <= 0 || capLines < 1) return { s: 0, overflow: false };
  let lines = 0;
  let s = cursor;
  for (let i = cursor - 1; i >= 0; i--) {
    const lu = heights[i];
    if (i === cursor - 1 && lu > capLines) return { s: i, overflow: true }; // 单句超屏：允许滚动
    const eff = lu + 0.45; // 单元间距
    if (lines + eff > capLines) break;
    lines += eff;
    s = i;
    if (cursor - i >= 80) break;
  }
  return { s, overflow: false };
}

const DIALOGUE_OPEN = /^[“「『‘]/;
const MARK_RE = /\[(\d+)\]/g; // 内联注文标记 [n]
type Tok = { k: 't'; s: string } | { k: 'm'; n: string };

function tokenize(t: string): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  MARK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MARK_RE.exec(t)) !== null) {
    if (m.index > last) out.push({ k: 't', s: t.slice(last, m.index) });
    out.push({ k: 'm', n: m[1] });
    last = m.index + m[0].length;
  }
  if (last < t.length) out.push({ k: 't', s: t.slice(last) });
  return out;
}

export default function Reader({ book, init, settings, onSettings, onProgress, onExit }: Props) {
  const [chapterIdx, setChapterIdx] = useState(Math.min(init.chapterIdx, book.chapters.length - 1));
  const [c, setC] = useState(Math.min(init.c, book.chapters[Math.min(init.chapterIdx, book.chapters.length - 1)].units.length));
  const [pageNo, setPageNo] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [bgImages, setBgImages] = useState<string[]>([]);
  const [notePop, setNotePop] = useState<{ n: string; text: string } | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  const ch = book.chapters[chapterIdx];
  const units = ch.units;
  const notesMap = useMemo(() => new Map((ch.notes ?? []).map((x) => [x.n, x.text])), [ch]);

  const lastAdvanceRef = useRef(0);
  const wheelLockRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const chapterRef = useRef(chapterIdx);
  const cRef = useRef(c);
  cRef.current = c;

  useEffect(() => {
    const onR = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  // ---- 排版参数（文本框） ----
  const fontSize = settings.fontSize;
  const boxW = Math.min(viewport.w - BOX_MARGIN * 2, BOX_MAX_W);
  const innerW = boxW - BOX_PAD_X * 2 - 2;
  const charsPerLine = Math.max(8, Math.floor(innerW / fontSize));
  const boxH = viewport.h * settings.panelRatio - BOX_MARGIN * 2;
  const contentH = Math.max(60, boxH - BOX_PAD_Y * 2 - 2 - 6);
  const capLines = Math.max(1, Math.floor(contentH / (fontSize * settings.lineHeight)));

  // 每单元行数（正文 + 注文附加行）
  const heights = useMemo(() => {
    return units.map((u) => {
      let n = lineCount(u.t, charsPerLine);
      if (settings.showNotes) {
        for (const tok of tokenize(u.t)) {
          if (tok.k === 'm') {
            const text = notesMap.get(tok.n);
            if (text) n += lineCount(`注${tok.n}：${text}`, charsPerLine);
          }
        }
      }
      return n;
    });
  }, [units, charsPerLine, settings.showNotes, notesMap]);
  const heightsRef = useRef(heights);
  heightsRef.current = heights;

  const range = useMemo(() => pageRange(heights, c, capLines), [heights, c, capLines]);
  const pageUnits = useMemo(() => units.slice(range.s, c), [units, range.s, c]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(null), 1600);
  }, []);

  const goChapter = useCallback(
    (idx: number, startC = 0) => {
      const i = Math.max(0, Math.min(idx, book.chapters.length - 1));
      chapterRef.current = i;
      setChapterIdx(i);
      setC(Math.min(startC, book.chapters[i].units.length));
      setPageNo((p) => p + 1);
      lastAdvanceRef.current = 0;
      setNotePop(null);
      showToast(book.chapters[i].title);
    },
    [book, showToast]
  );

  useEffect(() => {
    showToast(book.chapters[chapterIdx].title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashPause = useCallback(() => {
    setPulse((p) => p + 1);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPulse(0), 450);
  }, []);

  // ---- 动作 ----
  const advance = useCallback(() => {
    if (menuOpen) return;
    const chNow = book.chapters[chapterRef.current];
    const next = chNow.units[c];
    if (!next) {
      if (chapterRef.current + 1 < book.chapters.length) goChapter(chapterRef.current + 1, 1);
      else showToast('全书读完 · 感谢陪伴');
      return;
    }
    const now = performance.now();
    if (next.p && c > 0 && now - lastAdvanceRef.current < settings.paragraphPauseMs) {
      flashPause();
      return;
    }
    lastAdvanceRef.current = now;
    setNotePop(null);
    const h = heightsRef.current;
    const prevRange = pageRange(h, c, capLines);
    const nextRange = pageRange(h, c + 1, capLines);
    if (nextRange.s > prevRange.s) setPageNo((p) => p + 1); // 翻页 → 换背景
    setC(c + 1);
  }, [menuOpen, book, c, capLines, settings.paragraphPauseMs, goChapter, showToast, flashPause]);

  const back = useCallback(() => {
    if (menuOpen) return;
    if (c <= 0) {
      if (chapterRef.current > 0) {
        const prevIdx = chapterRef.current - 1;
        goChapter(prevIdx, book.chapters[prevIdx].units.length);
      }
      return;
    }
    setNotePop(null);
    setC(c - 1);
  }, [menuOpen, c, book, goChapter]);

  const backPage = useCallback(() => {
    if (menuOpen) return;
    const cur = pageRange(heightsRef.current, c, capLines);
    if (cur.s < c) { setNotePop(null); setC(cur.s); }
  }, [menuOpen, c, capLines]);

  const nextChapter = useCallback(() => {
    if (chapterRef.current + 1 < book.chapters.length) goChapter(chapterRef.current + 1, 1);
    else showToast('已是最后一章');
  }, [book, goChapter, showToast]);

  const act = useCallback(
    (a: GAction | 'next' | 'prev' | 'toggleMenu' | 'toggleChrome') => {
      switch (a) {
        case 'advance': case 'next': advance(); break;
        case 'back': case 'prev': back(); break;
        case 'backPage': backPage(); break;
        case 'nextChapter': nextChapter(); break;
        case 'menu': setMenuOpen((v) => !v); break;
        case 'toggleChrome': setChromeHidden((v) => !v); break;
      }
    },
    [advance, back, backPage, nextChapter]
  );

  // 键盘
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen((v) => !v); e.preventDefault(); return; }
      if (menuOpen) return;
      if (e.repeat) return;
      switch (e.key) {
        case ' ': case 'Enter': case 'ArrowRight': case 'ArrowDown':
          e.preventDefault(); act('advance'); break;
        case 'Backspace': case 'ArrowLeft': case 'ArrowUp':
          e.preventDefault(); act('back'); break;
        case 'PageUp': case '[': act('backPage'); break;
        case 'PageDown': case ']': act('nextChapter'); break;
        case 'h': case 'H': act('toggleChrome'); break;
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [act, menuOpen]);

  useGamepad(act, !menuOpen);

  // 进度持久化（去抖）
  useEffect(() => {
    const t = window.setTimeout(() => onProgress({ bookId: book.id, chapterIdx, c }), 250);
    return () => window.clearTimeout(t);
  }, [chapterIdx, c, book.id, onProgress]);

  // 卸载时立即落盘
  useEffect(() => {
    return () => {
      onProgress({ bookId: book.id, chapterIdx: chapterRef.current, c: cRef.current });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 触屏 / 指针 / 滚轮 ----
  const onPointer = (e: React.PointerEvent) => {
    if (menuOpen) return;
    if ((e.target as HTMLElement).closest('[data-stop]')) return;
    if (e.button !== 0 && e.button !== 2) return;
    if (e.clientX < viewport.w * 0.28) { act('back'); return; }
    act('advance');
  };
  const onWheel = (e: React.WheelEvent) => {
    if (menuOpen) return;
    const now = performance.now();
    if (now - wheelLockRef.current < 220) return;
    wheelLockRef.current = now;
    if (e.deltaY > 0) act('advance');
    else act('back');
  };

  // ---- 渲染辅助：人名高亮 / 注文 ----
  const nameRe = settings.markNames ? nameRegex(book.id) : null;
  const renderText = (s: string, keyBase: string) => {
    if (!nameRe) return <span key={keyBase}>{s}</span>;
    const nodes: React.ReactNode[] = [];
    nameRe.lastIndex = 0;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = nameRe.exec(s)) !== null) {
      if (m.index > last) nodes.push(<span key={`${keyBase}-t${i++}`}>{s.slice(last, m.index)}</span>);
      nodes.push(<span key={`${keyBase}-n${i++}`} className="hl-name">{m[0]}</span>);
      last = m.index + m[0].length;
    }
    if (last < s.length) nodes.push(<span key={`${keyBase}-t${i++}`}>{s.slice(last)}</span>);
    return <>{nodes}</>;
  };

  const chipClick = (n: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = notesMap.get(n) ?? '';
    setNotePop((cur) => (cur && cur.n === n ? null : { n, text }));
  };

  const renderUnit = (u: Unit, gIdx: number) => {
    const toks = tokenize(u.t);
    const embedded =
      settings.showNotes
        ? toks
            .filter((t): t is Extract<Tok, { k: 'm' }> => t.k === 'm' && !!notesMap.get(t.n))
            .map((t) => ({ n: t.n, text: notesMap.get(t.n)! }))
        : [];
    const isDlg = settings.dialogueIndent && DIALOGUE_OPEN.test(u.t);
    return (
      <div key={gIdx} className={`unit${u.p ? ' para' : ''}${isDlg ? ' dlg' : ''}`}>
        {toks.map((tok, i) =>
          tok.k === 't' ? (
            renderText(tok.s, `${gIdx}-${i}`)
          ) : (
            <sup key={`${gIdx}-m${i}`} className="note-chip" data-stop title="查看注文" onClick={(e) => chipClick(tok.n, e)}>
              [{tok.n}]
            </sup>
          )
        )}
        {embedded.length > 0 && (
          <div className="unit-notes">
            {embedded.map((x) => (
              <div key={x.n} className="unit-note">
                <span className="note-tag">注{x.n}</span>
                <span className="note-text">{x.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const total = units.length;
  const showStart = c === 0;
  const progressLabel = `${ch.title} · ${Math.min(c, total)}/${total}`;
  const serifStack = "'Source Han Serif SC','Noto Serif SC','Songti SC','SimSun',serif";
  const sansStack = "'Source Han Sans SC','Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif";

  const importBgs = (files: FileList | null) => {
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((f) => {
      if (f.type.startsWith('image/')) urls.push(URL.createObjectURL(f));
    });
    setBgImages((prev) => [...prev, ...urls]);
    if (settings.bgMode === 'off' || settings.bgMode === 'procedural') onSettings({ ...settings, bgMode: 'images' });
  };

  return (
    <div
      className={`reader ${chromeHidden ? 'chrome-off' : ''}`}
      onPointerUp={onPointer}
      onContextMenu={(e) => { e.preventDefault(); act('back'); }}
      onWheel={onWheel}
    >
      <BackgroundLayer mode={settings.bgMode} bgKey={pageNo} strength={settings.bgStrength} images={bgImages} viewport={viewport} />

      {!chromeHidden && (
        <header className="topbar" data-stop>
          <button className="tb-btn" onClick={onExit} title="返回书架">‹ 书架</button>
          <div className="tb-title" onClick={() => setMenuOpen(true)}>{progressLabel}</div>
          <div className="tb-right">
            <button className="tb-btn" onClick={() => setChromeHidden((v) => !v)} title="隐藏界面 (H)">◐</button>
            <button className="tb-btn" onClick={() => setMenuOpen(true)} title="菜单 (Esc)">☰</button>
          </div>
        </header>
      )}

      {toast && <div className="chapter-toast" key={toast}>{toast}</div>}

      {notePop && (
        <div className="note-pop" data-stop>
          <div className="note-pop-head">
            <span>注 {notePop.n}</span>
            <button className="tb-btn" onClick={() => setNotePop(null)}>✕</button>
          </div>
          <div className="note-pop-body">{notePop.text}</div>
        </div>
      )}

      {showStart && !menuOpen && (
        <div className="start-hint">
          <div className="start-title">{ch.title}</div>
          <div className="start-sub">点击 / 空格 / A 键 开始逐句阅读</div>
        </div>
      )}

      {/* 文本框 */}
      <div
        className={`textbox ${range.overflow ? 'scrollable' : ''}`}
        style={{
          height: `calc(${(settings.panelRatio * 100).toFixed(3)}vh - ${BOX_MARGIN * 2}px)`,
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
          fontFamily: settings.fontFamily === 'serif' ? serifStack : sansStack,
        }}
      >
        <div className="panel-inner" key={`${chapterIdx}-${range.s}`}>
          {pageUnits.map((u, i) => renderUnit(u, range.s + i))}
          {pulse > 0 && <div className="pause-pulse">…</div>}
        </div>
      </div>

      {/* 角落快捷按钮（文本框上沿外侧） */}
      {!chromeHidden && !menuOpen && (
        <>
          <button className="fab fab-l" data-stop style={{ bottom: `calc(${(settings.panelRatio * 100).toFixed(3)}vh - ${BOX_MARGIN}px + 12px)` }} onClick={(e) => { e.stopPropagation(); act('back'); }} title="上一句 (←)">⟲</button>
          <button className="fab fab-r" data-stop style={{ bottom: `calc(${(settings.panelRatio * 100).toFixed(3)}vh - ${BOX_MARGIN}px + 12px)` }} onClick={(e) => { e.stopPropagation(); act('advance'); }} title="下一句 (空格)">▸</button>
        </>
      )}

      {!chromeHidden && settings.showHints && (
        <div className="hints" data-stop>
          {showStart ? '空格/点击 = 开始' : '空格/点击 ▸ 下一句 · ← 回退 · PgUp 回页 · 点 [注] 看注文 · Esc 菜单'}
        </div>
      )}

      <Drawer
        open={menuOpen}
        book={book}
        chapterIdx={chapterIdx}
        onJump={(i) => { goChapter(i, 1); setMenuOpen(false); }}
        settings={settings}
        onSettings={(s) => onSettings(s)}
        onImportBgs={importBgs}
        bgImageCount={bgImages.length}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  );
}
