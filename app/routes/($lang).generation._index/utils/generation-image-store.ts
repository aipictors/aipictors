export const GENERATION_IMAGE_DB_NAME = "aipictors-generation-state"
export const GENERATION_IMAGE_STORE_NAME = "images"

/**
 * 画像生成画面の大きい項目（参照画像・ControlNet の画像の data URL）の置き場所。
 * テストではメモリの実装に差し替える
 */
export type GenerationImageStore = {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
}

export const openGenerationImageDatabase = async () => {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return null
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(GENERATION_IMAGE_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(GENERATION_IMAGE_STORE_NAME)) {
        db.createObjectStore(GENERATION_IMAGE_STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open generation database"))
    }
  })
}

/**
 * IndexedDB の 1 回の読み書き。開けなければ例外にする（呼び出し側で localStorage だけの保存に切り替える）
 */
const runTransaction = async <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest | null,
) => {
  const db = await openGenerationImageDatabase()
  if (!db) {
    throw new Error("IndexedDB is not available")
  }

  return new Promise<T>((resolve, reject) => {
    let result: T
    const transaction = db.transaction(GENERATION_IMAGE_STORE_NAME, mode)
    const request = run(transaction.objectStore(GENERATION_IMAGE_STORE_NAME))
    if (request) {
      request.onsuccess = () => {
        result = request.result as T
      }
    }
    transaction.oncomplete = () => {
      db.close()
      resolve(result)
    }
    transaction.onerror = () => {
      db.close()
      reject(
        transaction.error ?? new Error("Failed to access generation image"),
      )
    }
    transaction.onabort = () => {
      db.close()
      reject(transaction.error ?? new Error("Generation image access aborted"))
    }
  })
}

/**
 * IndexedDB の置き場所を作る。IndexedDB が無い環境では null
 */
export const createIndexedDbGenerationImageStore =
  (): GenerationImageStore | null => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return null
    }

    return {
      async get(key) {
        const value = await runTransaction<unknown>("readonly", (store) =>
          store.get(key),
        )
        return typeof value === "string" ? value : null
      },
      async put(key, value) {
        await runTransaction<void>("readwrite", (store) =>
          store.put(value, key),
        )
      },
      async delete(key) {
        await runTransaction<void>("readwrite", (store) => store.delete(key))
      },
      async keys() {
        const keys = await runTransaction<IDBValidKey[]>("readonly", (store) =>
          store.getAllKeys(),
        )
        return (keys ?? []).filter(
          (key): key is string => typeof key === "string",
        )
      },
    }
  }

/**
 * メモリの置き場所（テスト用）
 */
export const createMemoryGenerationImageStore = () => {
  const values = new Map<string, string>()
  const store: GenerationImageStore = {
    async get(key) {
      return values.get(key) ?? null
    },
    async put(key, value) {
      values.set(key, value)
    },
    async delete(key) {
      values.delete(key)
    },
    async keys() {
      return [...values.keys()]
    },
  }
  return { store, values }
}
