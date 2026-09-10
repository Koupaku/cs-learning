// 极简 IndexedDB 封装：存导入的书（books），进度/设置在 localStorage
const DB_NAME = 'sentence-reader';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('books')) db.createObjectStore('books', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export const idbGet = <T>(store: string, key: string) => tx<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>);
export const idbSet = <T>(store: string, value: T) => tx<IDBValidKey>(store, 'readwrite', (s) => s.put(value));
export const idbAll = <T>(store: string) => tx<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>);
export const idbDel = (store: string, key: string) => tx<undefined>(store, 'readwrite', (s) => s.delete(key) as IDBRequest<undefined>);

// ---- localStorage（进度 / 设置） ----
const LS = {
  progress: 'sr:progress-v1',
  settings: 'sr:settings-v1',
};

export function lsLoad<T>(key: keyof typeof LS, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS[key]);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function lsSave(key: keyof typeof LS, value: unknown) {
  try {
    localStorage.setItem(LS[key], JSON.stringify(value));
  } catch {
    /* 忽略配额错误 */
  }
}
