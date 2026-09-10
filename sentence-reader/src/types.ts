// 共享类型
export interface Unit {
  t: string;   // 文本
  p: boolean;  // 是否段首
}

export interface Note {
  n: string;   // 编号（章内从 1 起）
  text: string;
}

export interface Chapter {
  title: string;
  notes?: Note[];
  units: Unit[];
}

export interface Book {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface Progress {
  bookId: string;
  chapterIdx: number;
  c: number; // 已消费句数（光标 = 下一句下标）
}

export type BgMode = 'procedural' | 'themed' | 'images' | 'off';

export interface Settings {
  fontSize: number;        // px
  fontFamily: 'serif' | 'sans';
  lineHeight: number;
  panelRatio: number;      // 文本框占屏高 0.2–0.6
  bgMode: BgMode;
  bgStrength: number;      // 0–100
  paragraphPauseMs: number;
  dialogueIndent: boolean;
  showHints: boolean;
  showNotes: boolean;      // 注文随句显示在文本下方
  markNames: boolean;      // 人名高亮
}

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 22,
  fontFamily: 'serif',
  lineHeight: 1.9,
  panelRatio: 0.4,
  bgMode: 'procedural',
  bgStrength: 80,
  paragraphPauseMs: 550,
  dialogueIndent: true,
  showHints: true,
  showNotes: true,
  markNames: true,
};
