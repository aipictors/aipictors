import type { GenerationImageStore } from "~/routes/($lang).generation._index/utils/generation-image-store"
import {
  MAX_GENERATION_STATE_FIELD_LENGTH,
  persistGenerationSnapshot,
} from "~/routes/($lang).generation._index/utils/persist-generation-snapshot"

/** localStorage の状態に置く、IndexedDB に移した項目のキー（項目名 → キー） */
export const LARGE_FIELD_REFS_KEY = "largeFieldRefs"

/** IndexedDB に置くキーの頭。ほかの用途のキーと混ざらないようにする */
const REF_PREFIX = "generation.state:"

/** 小さくても IndexedDB に移す項目（参照画像・ControlNet の画像） */
const IMAGE_FIELDS = [
  "i2iImageBase64",
  "controlNetImageBase64",
  "controlNetMaskImageBase64",
]

/** 保存しない項目（読み込み時に捨てている） */
const SKIPPED_FIELDS = ["previewImageURL"]

type StorageLike = Pick<Storage, "setItem" | "removeItem">

export type LargeFieldRefs = Record<string, string>

const isEmptyValue = (value: unknown) => value === "" || value === null

const getContext = (snapshot: unknown) => {
  if (typeof snapshot !== "object" || snapshot === null) return null
  const context = (snapshot as Record<string, unknown>).context
  if (typeof context !== "object" || context === null) return null
  return context as Record<string, unknown>
}

/**
 * IndexedDB に移す項目か（画像の data URL、そのほか長い文字列）
 */
const isLargeField = (key: string, value: unknown): value is string => {
  if (typeof value !== "string" || value === "") return false
  if (SKIPPED_FIELDS.includes(key)) return false
  return (
    IMAGE_FIELDS.includes(key) ||
    value.length > MAX_GENERATION_STATE_FIELD_LENGTH
  )
}

/**
 * 状態を、localStorage に置く小さい状態と、IndexedDB に移す大きい項目に分ける
 */
export function splitGenerationSnapshot(snapshot: unknown) {
  const context = getContext(snapshot)
  const large: Record<string, string> = {}
  if (context === null) return { slim: snapshot, large }
  const slimContext: Record<string, unknown> = { ...context }
  for (const [key, value] of Object.entries(context)) {
    if (isLargeField(key, value)) {
      large[key] = value
      slimContext[key] = ""
    } else if (
      SKIPPED_FIELDS.includes(key) &&
      typeof value === "string" &&
      value.length > MAX_GENERATION_STATE_FIELD_LENGTH
    ) {
      slimContext[key] = null
    }
  }
  return {
    slim: { ...(snapshot as Record<string, unknown>), context: slimContext },
    large,
  }
}

/**
 * 保存データから IndexedDB のキーを取り出して消す（状態機械に渡す前に外す）
 */
export function takeLargeFieldRefs(snapshot: unknown): LargeFieldRefs {
  if (typeof snapshot !== "object" || snapshot === null) return {}
  const record = snapshot as Record<string, unknown>
  const refs = record[LARGE_FIELD_REFS_KEY]
  delete record[LARGE_FIELD_REFS_KEY]
  if (typeof refs !== "object" || refs === null) return {}
  const result: LargeFieldRefs = {}
  for (const [key, value] of Object.entries(refs)) {
    if (typeof value === "string" && value.startsWith(REF_PREFIX)) {
      result[key] = value
    }
  }
  return result
}

/**
 * IndexedDB から読み込んだ画像のうち、状態に入れてよいもの。
 * 読み込みの間にユーザーが画像を入れた（空でなくなった）項目は上書きしない
 */
export function pickRestorableImages(
  latest: object,
  loaded: Record<string, string>,
) {
  const context = latest as Record<string, unknown>
  const images: Record<string, string> = {}
  for (const [field, value] of Object.entries(loaded)) {
    if (isEmptyValue(context[field])) images[field] = value
  }
  return images
}

/**
 * 状態に IndexedDB へ移していない大きい項目があるか（以前の保存データの移行に使う）
 */
export function hasInlineLargeFields(snapshot: unknown) {
  return Object.keys(splitGenerationSnapshot(snapshot).large).length > 0
}

/** 使っていない画像をこれより古いものだけ消す（ほかのタブが使っている新しい画像を消さない） */
const PRUNE_AGE_MS = 24 * 60 * 60 * 1000

const createRef = (field: string, now: number) => {
  const random = Math.random().toString(36).slice(2, 10)
  return `${REF_PREFIX}${field}:${now.toString(36)}-${random}`
}

const parseRef = (ref: string) => {
  const body = ref.slice(REF_PREFIX.length)
  const separator = body.lastIndexOf(":")
  const time = Number.parseInt(body.slice(separator + 1).split("-")[0], 36)
  return {
    field: body.slice(0, separator),
    createdAt: Number.isFinite(time) ? time : 0,
  }
}

/**
 * 画像生成画面の状態の保存。
 * 大きい項目は IndexedDB に置き、localStorage には小さい状態とそのキーだけを置く。
 * IndexedDB が使えない・書き込めないときは、localStorage だけの保存（容量が足りなければ画像を外す）に切り替える
 */
export function createGenerationStatePersister(options: {
  storage: StorageLike
  store: GenerationImageStore | null
  /** 読み込んだ保存データにあった IndexedDB のキー（読み込み待ちの項目） */
  pendingRefs?: LargeFieldRefs
  now?: () => number
}) {
  const now = options.now ?? Date.now
  const { storage } = options
  let store = options.store
  /** IndexedDB に書いた（書いている）値とキー */
  const written = new Map<string, { ref: string; value: string }>()
  /** IndexedDB からまだ読み込んでいない項目のキー */
  const pending = new Map<string, string>(
    Object.entries(options.pendingRefs ?? {}),
  )
  let latestSnapshot: unknown

  const fallback = () => {
    store = null
    written.clear()
    pending.clear()
    if (latestSnapshot !== undefined) {
      persistGenerationSnapshot(storage, latestSnapshot)
    }
  }

  const write = (ref: string, value: string, oldRef: string | null) => {
    const current = store
    if (current === null) return
    current
      .put(ref, value)
      .then(() => {
        if (oldRef !== null) {
          return current.delete(oldRef).catch(() => {})
        }
      })
      .catch((error) => {
        console.warn("Failed to save generation image:", error)
        // 書けなければ画像を含めて localStorage に保存し直す（入らなければ画像は外れる）
        if (written.get(parseRef(ref).field)?.ref === ref) fallback()
      })
  }

  /**
   * 状態を保存する（同期。IndexedDB への書き込みは後ろで進む）
   * @returns localStorage への保存結果
   */
  const persist = (snapshot: unknown): "full" | "slim" | null => {
    latestSnapshot = snapshot
    if (store === null) {
      return persistGenerationSnapshot(storage, snapshot)
    }
    const context = getContext(snapshot)
    const { slim, large } = splitGenerationSnapshot(snapshot)
    const refs: LargeFieldRefs = {}

    for (const [field, value] of Object.entries(large)) {
      pending.delete(field)
      const cached = written.get(field)
      if (cached !== undefined && cached.value === value) {
        refs[field] = cached.ref
        continue
      }
      const ref = createRef(field, now())
      written.set(field, { ref, value })
      refs[field] = ref
      write(ref, value, cached?.ref ?? null)
    }

    for (const [field, ref] of pending) {
      // 読み込み待ちの間は空のままなら前回のキーを残す。ほかの値が入ったら（ユーザーが変えた）捨てる
      if (context !== null && isEmptyValue(context[field])) {
        refs[field] = ref
      } else {
        pending.delete(field)
      }
    }

    // 画像を外した（空にした）項目は IndexedDB からも消す
    for (const [field, cached] of written) {
      if (field in refs) continue
      written.delete(field)
      store.delete(cached.ref).catch(() => {})
    }

    return persistGenerationSnapshot(storage, {
      ...(slim as Record<string, unknown>),
      [LARGE_FIELD_REFS_KEY]: refs,
    })
  }

  /**
   * IndexedDB から読み込み待ちの項目を読む。読めなかった項目は含めない
   */
  const load = async (): Promise<Record<string, string>> => {
    const current = store
    if (current === null || pending.size === 0) return {}
    const entries = [...pending]
    const values: Record<string, string> = {}
    try {
      for (const [field, ref] of entries) {
        const value = await current.get(ref)
        if (value !== null) {
          values[field] = value
        } else if (pending.get(field) === ref) {
          // 消えていた画像のキーは残さない
          pending.delete(field)
        }
      }
    } catch (error) {
      console.warn("Failed to load generation images:", error)
      return {}
    }
    return values
  }

  /**
   * 読み込んだ値を状態に入れたことを伝え、同じ値を書き直さないようにする。
   * 入れなかった項目のキーは、次の保存で空なら残し、値が入っていれば捨てる
   */
  const markLoaded = (applied: Record<string, string>) => {
    for (const [field, ref] of [...pending]) {
      const value = applied[field]
      if (value === undefined) continue
      pending.delete(field)
      if (!written.has(field)) written.set(field, { ref, value })
    }
  }

  /**
   * 今の状態で使っていない古い IndexedDB の画像を消す（書き直したあと消し損ねた画像など）
   */
  const prune = async () => {
    const current = store
    if (current === null) return
    try {
      const used = new Set([
        ...[...written.values()].map((item) => item.ref),
        ...pending.values(),
      ])
      const keys = await current.keys()
      for (const key of keys) {
        if (
          key.startsWith(REF_PREFIX) &&
          !used.has(key) &&
          now() - parseRef(key).createdAt > PRUNE_AGE_MS
        ) {
          await current.delete(key)
        }
      }
    } catch (_error) {}
  }

  return {
    persist,
    load,
    markLoaded,
    prune,
    /** IndexedDB を使っているか */
    isUsingStore: () => store !== null,
  }
}
