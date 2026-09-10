// 书架：内置书 + 导入书 + 导入 TXT
import type { Progress } from '../types';

export interface BookMeta {
  id: string;
  title: string;
  chapterCount: number;
  builtin?: boolean;
}

interface Props {
  meta: BookMeta[];
  progress: Record<string, Progress>;
  onOpen: (id: string) => void;
  onRequestImport: () => void;
  onDelete: (id: string) => void;
  busy?: string | null;
  error?: string | null;
}

export default function ShelfView({ meta, progress, onOpen, onRequestImport, onDelete, busy, error }: Props) {
  return (
    <div className="shelf">
      <header className="shelf-head">
        <h1>逐句阅读器</h1>
        <p>把名著变成文字游戏——每次按键推进一句，读得进去为止。</p>
      </header>

      {busy && <div className="shelf-busy">{busy}</div>}
      {error && <div className="shelf-error">{error}</div>}

      <div className="shelf-grid">
        {meta.map((m) => {
          const pr = progress[m.id];
          return (
            <article key={m.id} className="card" onClick={() => onOpen(m.id)}>
              <div className="card-title">{m.title}</div>
              <div className="card-meta">
                {m.chapterCount} 章
                {pr && pr.c > 0 && ` · 读到第 ${pr.chapterIdx + 1} 章 · ${pr.c} 句`}
              </div>
              <div className="card-actions">
                <span className="card-go">{pr ? '继续阅读 ›' : '开始阅读 ›'}</span>
                {!m.builtin && (
                  <button
                    className="card-del"
                    onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
                    title="删除这本书"
                  >✕</button>
                )}
              </div>
            </article>
          );
        })}

        <article className="card card-add" onClick={onRequestImport}>
          <div className="add-plus">＋</div>
          <div className="add-text">导入 TXT 文档</div>
          <div className="add-sub">自动分章 · 断句 · 即读</div>
        </article>
      </div>

      <footer className="shelf-foot">
        空格 / 点击 = 推进一句 · ← 回退 · PgUp 回页 · RB 下一章 · Esc 菜单 · 支持手柄（A/B/十字键/肩键）
      </footer>
    </div>
  );
}
