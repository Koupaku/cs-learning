// 抽屉：章节跳转 + 阅读设置 + 背景源
import type { Book, Settings } from '../types';

interface Props {
  open: boolean;
  book: Book;
  chapterIdx: number;
  onJump: (idx: number) => void;
  settings: Settings;
  onSettings: (s: Settings) => void;
  onImportBgs: (files: FileList | null) => void;
  bgImageCount: number;
  onClose: () => void;
}

const BG_MODES: { id: Settings['bgMode']; t: string }[] = [
  { id: 'procedural', t: '程序化' },
  { id: 'themed', t: '主题图包' },
  { id: 'images', t: '我的图片' },
  { id: 'off', t: '关闭' },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dr-row">
      <div className="dr-label">{label}</div>
      <div className="dr-ctl">{children}</div>
    </div>
  );
}

export default function Drawer({ open, book, chapterIdx, onJump, settings, onSettings, onImportBgs, bgImageCount, onClose }: Props) {
  if (!open) return null;
  const upd = (patch: Partial<Settings>) => onSettings({ ...settings, ...patch });

  return (
    <div className="drawer-mask" data-stop onClick={onClose}>
      <aside className="drawer" data-stop onClick={(e) => e.stopPropagation()}>
        <header className="dr-head">
          <span>菜单</span>
          <button className="tb-btn" onClick={onClose}>✕</button>
        </header>

        <div className="dr-body">
          <section className="dr-sec">
            <h4>章节 · {book.chapters.length}</h4>
            <div className="dr-chaps">
              {book.chapters.map((ch, i) => (
                <button
                  key={i}
                  className={`dr-chap ${i === chapterIdx ? 'active' : ''}`}
                  onClick={() => onJump(i)}
                >
                  <span>{ch.title}</span>
                  <em>{ch.units.length} 句</em>
                </button>
              ))}
            </div>
          </section>

          <section className="dr-sec">
            <h4>阅读</h4>
            <Row label={`字号 ${settings.fontSize}px`}>
              <input type="range" min={16} max={34} step={1} value={settings.fontSize}
                onChange={(e) => upd({ fontSize: +e.target.value })} />
            </Row>
            <Row label={`面板高度 ${Math.round(settings.panelRatio * 100)}%`}>
              <input type="range" min={25} max={60} step={1} value={Math.round(settings.panelRatio * 100)}
                onChange={(e) => upd({ panelRatio: +e.target.value / 100 })} />
            </Row>
            <Row label="字体">
              <div className="seg">
                <button className={settings.fontFamily === 'serif' ? 'on' : ''} onClick={() => upd({ fontFamily: 'serif' })}>衬线</button>
                <button className={settings.fontFamily === 'sans' ? 'on' : ''} onClick={() => upd({ fontFamily: 'sans' })}>黑体</button>
              </div>
            </Row>
            <Row label={`段落停顿 ${settings.paragraphPauseMs}ms`}>
              <input type="range" min={0} max={1200} step={50} value={settings.paragraphPauseMs}
                onChange={(e) => upd({ paragraphPauseMs: +e.target.value })} />
            </Row>
            <Row label="对话缩进">
              <label className="check">
                <input type="checkbox" checked={settings.dialogueIndent}
                  onChange={(e) => upd({ dialogueIndent: e.target.checked })} /> 引号句缩进
              </label>
            </Row>
            <Row label="注文">
              <label className="check">
                <input type="checkbox" checked={settings.showNotes}
                  onChange={(e) => upd({ showNotes: e.target.checked })} /> 随句显示注文
              </label>
              <div className="dr-label2">关闭后仍可点击句中的 [n] 查看</div>
            </Row>
            <Row label="人名高亮">
              <label className="check">
                <input type="checkbox" checked={settings.markNames}
                  onChange={(e) => upd({ markNames: e.target.checked })} /> 高亮人物名字
              </label>
            </Row>
          </section>

          <section className="dr-sec">
            <h4>背景</h4>
            <Row label="来源">
              <div className="seg">
                {BG_MODES.map((m) => (
                  <button key={m.id} className={settings.bgMode === m.id ? 'on' : ''} onClick={() => upd({ bgMode: m.id })}>
                    {m.t}
                  </button>
                ))}
              </div>
            </Row>
            {settings.bgMode === 'images' && (
              <Row label="我的图片">
                <div className="bg-import">
                  <label className="btn-sm" data-stop>
                    导入图片{bgImageCount > 0 ? `（已 ${bgImageCount} 张）` : ''}
                    <input type="file" accept="image/*" multiple hidden
                      onChange={(e) => { onImportBgs(e.target.files); e.target.value = ''; }} />
                  </label>
                </div>
              </Row>
            )}
            {settings.bgMode !== 'off' && (
              <Row label={`浓度 ${settings.bgStrength}%`}>
                <input type="range" min={0} max={100} step={5} value={settings.bgStrength}
                  onChange={(e) => upd({ bgStrength: +e.target.value })} />
              </Row>
            )}
          </section>

          <p className="dr-foot">翻页自动更换背景 · 每章完成时大切换</p>
        </div>
      </aside>
    </div>
  );
}
