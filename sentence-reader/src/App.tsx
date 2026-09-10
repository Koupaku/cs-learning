import { useCallback, useEffect, useRef, useState } from 'react';
import type { Book, Progress, Settings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { decodeText, buildBook } from './text/splitCore';
import { idbAll, idbDel, idbGet, idbSet, lsLoad, lsSave } from './db';
import ShelfView, { type BookMeta } from './components/ShelfView';
import Reader from './components/Reader';

const BUILTIN_ID = 'bainian';
const BUILTIN_META: BookMeta = { id: BUILTIN_ID, title: '《百年孤独》（黄锦炎 译）', chapterCount: 21, builtin: true };
const BOOK_URL = `${import.meta.env.BASE_URL}data/book-bainian.sentences.json`;

type View =
  | { kind: 'shelf' }
  | { kind: 'reader'; book: Book; init: Progress };

export default function App() {
  const [view, setView] = useState<View>({ kind: 'shelf' });
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...lsLoad('settings', DEFAULT_SETTINGS) }));
  const [progress, setProgress] = useState<Record<string, Progress>>(() => lsLoad('progress', {}));
  const [imported, setImported] = useState<BookMeta[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const builtinRef = useRef<Book | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importedCache = useRef<Map<string, Book>>(new Map());

  // 持久化
  useEffect(() => lsSave('settings', settings), [settings]);
  useEffect(() => lsSave('progress', progress), [progress]);

  // 载入已导入书元信息
  useEffect(() => {
    idbAll<Book>('books')
      .then((books) => setImported(books.map((b) => ({ id: b.id, title: b.title, chapterCount: b.chapters.length }))))
      .catch(() => undefined);
  }, [view.kind === 'shelf']); // 每次回到书架刷新

  const loadBuiltin = useCallback(async (): Promise<Book> => {
    if (builtinRef.current) return builtinRef.current;
    const res = await fetch(BOOK_URL);
    if (!res.ok) throw new Error(`内置书加载失败 HTTP ${res.status}`);
    const chapters = (await res.json()) as Book['chapters'];
    builtinRef.current = { id: BUILTIN_ID, title: BUILTIN_META.title, chapters };
    return builtinRef.current;
  }, []);

  const openBook = useCallback(
    async (id: string) => {
      setBusy('载入中…');
      setError(null);
      try {
        let book: Book | undefined;
        if (id === BUILTIN_ID) book = await loadBuiltin();
        else {
          book = importedCache.current.get(id) ?? (await idbGet<Book>('books', id));
          if (!book) throw new Error('未找到这本书（可能已被删除）');
          importedCache.current.set(id, book);
        }
        const saved = progress[id];
        const init: Progress = saved ? { ...saved, bookId: id } : { bookId: id, chapterIdx: 0, c: 0 };
        const ci = Math.min(init.chapterIdx, book.chapters.length - 1);
        const ch = book.chapters[ci];
        init.chapterIdx = ci;
        init.c = Math.min(init.c, ch.units.length);
        setView({ kind: 'reader', book, init });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [loadBuiltin, progress]
  );

  const onProgress = useCallback((p: Progress) => {
    setProgress((prev) => ({ ...prev, [p.bookId]: p }));
  }, []);

  const handleImportFile = useCallback(
    async (file: File) => {
      setBusy(`解析 ${file.name} …`);
      setError(null);
      try {
        const buf = await file.arrayBuffer();
        const { text, enc } = decodeText(buf);
        const chapters = buildBook(text);
        const total = chapters.reduce((a, c) => a + c.units.length, 0);
        if (chapters.length === 0 || total === 0) throw new Error('未能从文档中解析出正文（请确认是 TXT 文本文件）');
        const id = crypto.randomUUID();
        const book: Book = { id, title: file.name.replace(/\.txt$/i, ''), chapters };
        await idbSet('books', book);
        importedCache.current.set(id, book);
        setImported((prev) => [...prev, { id, title: book.title, chapterCount: chapters.length }]);
        await openBook(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [openBook]
  );

  const handleDelete = useCallback(async (id: string) => {
    await idbDel('books', id);
    importedCache.current.delete(id);
    setImported((prev) => prev.filter((m) => m.id !== id));
    setProgress((prev) => {
      const { [id]: _drop, ...rest } = prev;
      return rest;
    });
  }, []);

  if (view.kind === 'reader') {
    return (
      <Reader
        key={view.book.id}
        book={view.book}
        init={view.init}
        settings={settings}
        onSettings={setSettings}
        onProgress={onProgress}
        onExit={() => setView({ kind: 'shelf' })}
      />
    );
  }

  const meta = [BUILTIN_META, ...imported];
  return (
    <>
      <ShelfView
        meta={meta}
        progress={progress}
        onOpen={openBook}
        onRequestImport={() => fileRef.current?.click()}
        onDelete={handleDelete}
        busy={busy}
        error={error}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.text,text/plain"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImportFile(f);
          e.target.value = '';
        }}
      />
    </>
  );
}
