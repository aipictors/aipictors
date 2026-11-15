import { getAuth, signOut, type User } from "firebase/auth"

/**
 * ログイン状態（Firebase が保存しているユーザー）の控え。
 *
 * Firebase はページを開くたびに保存済みのユーザーを確かめ（accounts:lookup とトークン更新）、
 * その通信が「通信の切れ」以外のエラー（一時的な 5xx・回数制限など）で失敗すると、
 * 保存済みのログインを消してしまう（@firebase/auth の reloadAndSetCurrentUserOrClear）。
 * サーバーでログインを取り消していないのに、開いたままのタブで突然ログアウトしていた。
 * 自分でログアウトしていないのにユーザーが消えたときは、この控えを保存場所に書き戻して元に戻す。
 * 本当にログインが無効なら、書き戻したあとのトークン更新で Firebase がまたログアウトさせる。
 */
const BACKUP_KEY = "aipictors.authBackup"
const RESTORE_ATTEMPT_KEY = "aipictors.authRestoreAttempt"

/** 書き戻しを試したあと、同じユーザーでもう一度試すまでの間隔（ログアウトとの繰り返しを防ぐ） */
export const AUTH_RESTORE_RETRY_INTERVAL_MS = 10 * 60 * 1000

/** Firebase の保存場所（@firebase/auth の indexedDBLocalPersistence と同じ） */
const DB_NAME = "firebaseLocalStorageDb"
const DB_VERSION = 1
const DB_STORE = "firebaseLocalStorage"
const DB_KEY_PATH = "fbase_key"
const APP_NAME = "[DEFAULT]"

export type AuthBackup = {
  uid: string
  /** user.toJSON()（Firebase が保存するものと同じ形） */
  value: Record<string, unknown>
}

type RestoreAttempt = {
  uid: string
  at: number
}

const readJson = <T>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key)
    return value === null ? null : (JSON.parse(value) as T)
  } catch {
    return null
  }
}

export const readAuthBackup = () => readJson<AuthBackup>(BACKUP_KEY)

export const saveAuthBackup = (user: User) => {
  try {
    const backup: AuthBackup = {
      uid: user.uid,
      value: user.toJSON() as Record<string, unknown>,
    }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
  } catch {
    // 保存できなくても、元に戻せないだけ
  }
}

export const clearAuthBackup = () => {
  try {
    localStorage.removeItem(BACKUP_KEY)
    localStorage.removeItem(RESTORE_ATTEMPT_KEY)
  } catch {
    // 同上
  }
}

export const markAuthRestoreAttempt = (uid: string, now = Date.now()) => {
  try {
    const attempt: RestoreAttempt = { uid, at: now }
    localStorage.setItem(RESTORE_ATTEMPT_KEY, JSON.stringify(attempt))
  } catch {
    // 同上
  }
}

/** 書き戻したあとにログインできた（トークンを取れた）ら、次に消えたときもまた戻せるようにする */
export const clearAuthRestoreAttempt = () => {
  try {
    localStorage.removeItem(RESTORE_ATTEMPT_KEY)
  } catch {
    // 同上
  }
}

/**
 * 控えを書き戻してよいか。同じユーザーで少し前に試して、またログアウトしたなら本当に無効とみなす
 */
export const shouldRestoreAuthBackup = (
  backup: AuthBackup | null,
  lastAttempt: RestoreAttempt | null,
  now: number,
) => {
  if (backup === null || typeof backup.uid !== "string") return false
  if (typeof backup.value !== "object" || backup.value === null) return false
  if (
    lastAttempt !== null &&
    lastAttempt.uid === backup.uid &&
    now - lastAttempt.at < AUTH_RESTORE_RETRY_INTERVAL_MS
  ) {
    return false
  }
  return true
}

export const readAuthRestoreAttempt = () =>
  readJson<RestoreAttempt>(RESTORE_ATTEMPT_KEY)

const openFirebaseDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) {
        request.result.createObjectStore(DB_STORE, { keyPath: DB_KEY_PATH })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error("indexedDB blocked"))
  })

/**
 * 控えを Firebase の保存場所に書き戻す。
 * Firebase は保存場所を 800ms ごとに見ていて（タブ間の同期と同じしくみ）、変化に気づくとそのユーザーでログインし直す
 */
export const restoreAuthBackup = async (backup: AuthBackup, apiKey: string) => {
  const key = `firebase:authUser:${apiKey}:${APP_NAME}`
  try {
    // IndexedDB が使えないときの保存先。次にページを開いたときに読まれる
    localStorage.setItem(key, JSON.stringify(backup.value))
  } catch {
    // 使えなければ IndexedDB だけ
  }
  try {
    const db = await openFirebaseDb()
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, "readwrite")
      transaction
        .objectStore(DB_STORE)
        .put({ [DB_KEY_PATH]: key, value: backup.value })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    db.close()
    return true
  } catch {
    return false
  }
}

/**
 * 自分でログアウトする。先に控えを消すので、ほかのタブも元に戻そうとしない
 */
export const logoutFirebase = async () => {
  clearAuthBackup()
  await signOut(getAuth())
}
