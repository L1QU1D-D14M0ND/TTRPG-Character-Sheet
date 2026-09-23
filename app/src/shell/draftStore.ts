/** One IndexedDB record. Not a character library. */
export const DRAFT_DB = 'ttrpg-character-sheet'
export const DRAFT_STORE = 'kv'
export const DRAFT_KEY = 'draft'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DRAFT_DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE)
      }
    }
    req.onsuccess = () => {
      const db = req.result
      // Another tab upgrading or deleting this database cannot proceed while
      // we hold the connection open, so yield instead of blocking it.
      db.onversionchange = () => db.close()
      resolve(db)
    }
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

/**
 * Each operation opens and closes its own connection. A connection left open
 * blocks `deleteDatabase` and any future version upgrade indefinitely, and
 * autosave touches this store every few seconds, so a leaked handle is the
 * normal case rather than the rare one.
 */
function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(DRAFT_STORE, mode)
        const req = run(tx.objectStore(DRAFT_STORE))
        // Resolve on transaction completion, not request success: a write is
        // only durable once its transaction commits.
        let result: T
        req.onsuccess = () => {
          result = req.result
        }
        tx.oncomplete = () => resolve(result)
        tx.onabort = () =>
          reject(tx.error ?? new Error('IndexedDB transaction aborted'))
        req.onerror = () =>
          reject(req.error ?? new Error('IndexedDB request failed'))
      }).finally(() => db.close()),
  )
}

/** Missing DB, private mode, or a failed read → `undefined`. */
export async function readDraft(): Promise<string | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  try {
    const value = await withStore('readonly', (store) => store.get(DRAFT_KEY))
    return typeof value === 'string' ? value : undefined
  } catch {
    return undefined
  }
}

export async function writeDraft(json: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    await withStore('readwrite', (store) => store.put(json, DRAFT_KEY))
  } catch {
    // Private mode / quota: Save/Load files still work.
  }
}

export async function clearDraft(): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    await withStore('readwrite', (store) => store.delete(DRAFT_KEY))
  } catch {
    // ignore
  }
}
