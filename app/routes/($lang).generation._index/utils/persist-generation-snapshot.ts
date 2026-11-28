export const GENERATION_STATE_STORAGE_KEY = "generation.state"

/**
 * 保存する状態の上限（JSON の文字数）。
 * 参照画像・ControlNet の画像は data URL で数 MB になり、
 * localStorage（約 5MB）を埋めて QuotaExceededError になっていた
 */
export const MAX_GENERATION_STATE_LENGTH = 1_000_000

/** これより長い文字列の項目（画像の data URL など）は容量が足りないときに外す */
export const MAX_GENERATION_STATE_FIELD_LENGTH = 20_000

/** 容量が足りないときに空にする項目と、その空の値 */
const LARGE_FIELD_EMPTY_VALUES: Record<string, unknown> = {
  i2iImageBase64: "",
  controlNetImageBase64: "",
  controlNetMaskImageBase64: "",
  previewImageURL: null,
  viewTaskIds: [],
}

type StorageLike = Pick<Storage, "setItem" | "removeItem">

/**
 * 状態から大きい項目（画像の data URL、選択中の履歴など）を外す
 */
export function slimGenerationSnapshot<T>(snapshot: T): T {
  if (typeof snapshot !== "object" || snapshot === null) return snapshot
  const record = snapshot as Record<string, unknown>
  const context = record.context
  if (typeof context !== "object" || context === null) return snapshot
  const slimContext: Record<string, unknown> = { ...context }
  for (const [key, value] of Object.entries(slimContext)) {
    if (key in LARGE_FIELD_EMPTY_VALUES) {
      slimContext[key] = LARGE_FIELD_EMPTY_VALUES[key]
      continue
    }
    if (
      typeof value === "string" &&
      value.length > MAX_GENERATION_STATE_FIELD_LENGTH
    ) {
      slimContext[key] = ""
    }
  }
  return { ...record, context: slimContext } as T
}

function trySetItem(storage: StorageLike, text: string) {
  try {
    storage.setItem(GENERATION_STATE_STORAGE_KEY, text)
    return true
  } catch (_error) {
    // QuotaExceededError・プライベートモードなど
    return false
  }
}

/**
 * 画像生成画面の状態を保存する。
 * 容量が足りないときは大きい項目を外して保存し直し、それでもだめなら保存を諦める（生成は続けられる）
 * @returns 保存した内容（"full" | "slim"）、保存できなければ null
 */
export function persistGenerationSnapshot(
  storage: StorageLike,
  snapshot: unknown,
): "full" | "slim" | null {
  let text: string
  try {
    text = JSON.stringify(snapshot)
  } catch (_error) {
    return null
  }
  if (text.length <= MAX_GENERATION_STATE_LENGTH && trySetItem(storage, text)) {
    return "full"
  }
  const slimText = JSON.stringify(slimGenerationSnapshot(snapshot))
  if (slimText.length > MAX_GENERATION_STATE_LENGTH) {
    return null
  }
  if (trySetItem(storage, slimText)) return "slim"
  // 前回保存した大きい状態が容量を使っているので、消してからもう一度だけ試す
  try {
    storage.removeItem(GENERATION_STATE_STORAGE_KEY)
  } catch (_error) {
    return null
  }
  return trySetItem(storage, slimText) ? "slim" : null
}
