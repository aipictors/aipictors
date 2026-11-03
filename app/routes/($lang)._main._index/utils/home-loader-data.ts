import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"

export const getUtcDateString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2)
  const day = `0${date.getUTCDate()}`.slice(-2)

  return `${year}/${month}/${day}`
}

export const createEmptyReleaseList = (): MicroCmsApiReleaseResponse => ({
  contents: [],
  totalCount: 0,
  offset: 0,
  limit: 4,
})

/**
 * ホームではお知らせのタイトルだけ使うので、本文（Markdown 全文）は HTML に入れない
 */
export function toReleaseSummary<T extends { description: string }>(release: T): T {
  return { ...release, description: "" }
}

/**
 * ホームの一覧で使わない、作品の詳細画面用の項目（HomeWork フラグメントは詳細画面と共通で項目が多い）。
 * HTML に入るローダーのデータが大きいと、回線の遅いスマホで最初の画像の読み込みが遅れる
 */
const HOME_LIST_OMIT_WORK_KEYS = [
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
  "otherGenerationParams",
  "pngInfo",
  "style",
  "ogpThumbnailImageUrl",
  "relatedUrl",
] as const

const HOME_LIST_OMIT_USER_KEYS = [
  "biography",
  "enBiography",
  "webFcmToken",
  "headerImageUrl",
  "promptonUser",
] as const

export function toHomeListWorks<T>(works: T[] | null | undefined): T[] {
  if (!Array.isArray(works)) return []
  return works.map((work) => {
    const copy = { ...(work as Record<string, unknown>) }
    for (const key of HOME_LIST_OMIT_WORK_KEYS) delete copy[key]
    if (copy.user && typeof copy.user === "object") {
      const user = { ...(copy.user as Record<string, unknown>) }
      for (const key of HOME_LIST_OMIT_USER_KEYS) delete user[key]
      copy.user = user
    }
    return copy as T
  })
}

const HOME_CATEGORIES = ["ゆめかわ", "ダークソウル", "パステル", "ちびキャラ"]

/**
 * ホームに出すタグを 2 つ選ぶ（秒が同じなら同じ結果になる）
 */
export const getRandomHomeCategories = (currentTime: Date) => {
  const secondSeed = Math.floor(currentTime.getTime() / 1000)

  const seededRandom = (seed: number, str: string) => {
    const combined = seed + str.charCodeAt(0)
    const x = Math.sin(combined) * 10000
    return x - Math.floor(x)
  }

  return HOME_CATEGORIES.map((cat) => ({
    cat,
    sortKey: seededRandom(secondSeed, cat),
  }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, 2)
    .map((item) => item.cat)
}
