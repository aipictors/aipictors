/**
 * 一覧に出す作品データから、詳細画面でしか使わない重い項目を外す（ローダーで HTML に入れる前に使う）。
 *
 * 一覧用のフラグメント（PhotoAlbumWork など）は詳細画面と共通で、PNG のメタデータ（pngInfo）や
 * いいねしたユーザー・プロンプトまで入っている。タグページではページに埋め込むデータの 6 割が pngInfo だった。
 * 作品のダイアログは開くときに作品を取り直すので、一覧では要らない。
 */

const OMIT_WORK_KEYS = [
  "pngInfo",
  "otherGenerationParams",
  "likedUsers",
  "prompt",
  "negativePrompt",
  "noise",
  "seed",
  "steps",
  "sampler",
  "scale",
  "strength",
  "vae",
  "clipSkip",
  "style",
  "ogpThumbnailImageUrl",
  "relatedUrl",
] as const

const OMIT_USER_KEYS = [
  "biography",
  "enBiography",
  "webFcmToken",
  "headerImageUrl",
  "promptonUser",
] as const

export function toListWork<T>(work: T): T {
  if (work === null || typeof work !== "object") return work
  const copy = { ...(work as Record<string, unknown>) }
  for (const key of OMIT_WORK_KEYS) delete copy[key]
  if (copy.user && typeof copy.user === "object") {
    const user = { ...(copy.user as Record<string, unknown>) }
    for (const key of OMIT_USER_KEYS) delete user[key]
    copy.user = user
  }
  return copy as T
}

export function toListWorks<T>(works: T[] | null | undefined): T[] {
  if (!Array.isArray(works)) return []
  return works.map(toListWork)
}
