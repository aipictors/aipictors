/**
 * 多言語の作品（ぴくたーちゃんの4コマなど）を、見る人の言語に合わせて出す。
 *
 * 作品の画像は 1 枚 1 言語で、言語ごとのタイトル・説明と「何枚目が何語か」は
 * files.aipictors.com/work-localizations/<作品ID>.json に置く（投稿する側が書く）。
 * {
 *   "version": 1,
 *   "languages": {
 *     "ja": { "title": "…", "description": "…", "imageIndex": 0 },
 *     "en": { "title": "…", "description": "…", "imageIndex": 1 }, …
 *   }
 * }
 * imageIndex は作品の画像の順番（0 がメイン、1 から追加の画像の順）。
 * 選んだ言語の画像を先頭にして、タイトル・説明もその言語にする（ほかの言語の画像はその後に元の順で並ぶ）。
 */

import type { SupportedLocale } from "~/utils/locale-path"

/** JSON を置く作者（ほかの作品では JSON を読みに行かない） */
const LOCALIZED_WORK_USER_LOGINS = new Set(["pictorchan"])

const LOCALIZATION_BASE_URL = "https://files.aipictors.com/work-localizations"

export type WorkLocalizationEntry = {
  title: string
  description: string
  imageIndex: number
}

export type WorkLocalization = {
  languages: Record<string, WorkLocalizationEntry>
}

type LocalizableWork = {
  id: string
  title: string
  enTitle: string
  description?: string | null
  enDescription?: string | null
  imageURL: string
  subWorks?: { id: string; imageUrl: string | null }[]
  user?: { login: string } | null
}

export const hasWorkLocalization = (work: {
  user?: { login: string } | null
}) => LOCALIZED_WORK_USER_LOGINS.has(work.user?.login ?? "")

const toLocalization = (value: unknown): WorkLocalization | null => {
  if (typeof value !== "object" || value === null) return null
  const languages = (value as { languages?: unknown }).languages
  if (typeof languages !== "object" || languages === null) return null
  const result: Record<string, WorkLocalizationEntry> = {}
  for (const [lang, entry] of Object.entries(languages)) {
    if (typeof entry !== "object" || entry === null) continue
    const { title, description, imageIndex } = entry as Record<string, unknown>
    if (typeof title !== "string" || typeof imageIndex !== "number") continue
    result[lang] = {
      title,
      description: typeof description === "string" ? description : "",
      imageIndex,
    }
  }
  return Object.keys(result).length > 0 ? { languages: result } : null
}

/** JSON を読む。無い・読めないときは null（作品はそのまま出す） */
export const fetchWorkLocalization = async (
  workId: string,
  timeoutMs = 1500,
): Promise<WorkLocalization | null> => {
  if (!/^\d+$/.test(workId)) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${LOCALIZATION_BASE_URL}/${workId}.json`, {
      signal: controller.signal,
      // Cloudflare の拠点で 5 分持つ（ブラウザでは無視される）
      cf: { cacheTtl: 300, cacheEverything: true },
    } as RequestInit)
    if (!response.ok) return null
    return toLocalization(await response.json())
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** ブラウザの言語タグを JSON の言語名にする（中国語は簡体字・繁体字に分ける） */
const toLocalizationLanguage = (tag: string) => {
  const lower = tag.trim().toLowerCase()
  if (lower.startsWith("zh")) {
    return /hant|-tw|-hk|-mo/.test(lower) ? "zh-Hant" : "zh-Hans"
  }
  return lower.split("-")[0] ?? ""
}

/** Accept-Language を希望順の言語タグにする */
export const parseAcceptLanguage = (acceptLanguage: string | null) =>
  (acceptLanguage ?? "")
    .split(",")
    .map((item, index) => {
      const [tag = "", ...params] = item.trim().split(";")
      const q = params
        .map((param) => param.trim().match(/^q=([\d.]+)$/)?.[1])
        .find((value) => value !== undefined)
      return { tag: tag.trim(), q: q === undefined ? 1 : Number(q), index }
    })
    .filter((item) => item.tag !== "" && item.tag !== "*" && item.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map((item) => item.tag)

/**
 * 出す言語を決める。ブラウザの希望順に見て、JSON にある言語を選ぶ。
 * 日本語・英語はサイトの表示言語（/en かどうか）を優先する（日本語のブラウザで /en を開いた人には英語）。
 * どれもなければサイトの表示言語
 */
export const pickWorkLanguage = (
  localization: WorkLocalization,
  siteLocale: SupportedLocale,
  preferredLanguages: readonly string[],
) => {
  const available = localization.languages
  for (const tag of preferredLanguages) {
    const lang = toLocalizationLanguage(tag)
    if (lang === "ja" || lang === "en") break
    if (available[lang]) return lang
  }
  if (available[siteLocale]) return siteLocale
  return Object.keys(available)[0] ?? siteLocale
}

/** 選んだ言語の画像を先頭にし、タイトル・説明をその言語にする */
export const applyWorkLocalization = <T extends LocalizableWork>(
  work: T,
  localization: WorkLocalization,
  lang: string,
): T => {
  const entry = localization.languages[lang]
  if (!entry) return work
  const subWorks = (work.subWorks ?? []).filter(
    (subWork) => subWork.imageUrl !== null,
  )
  const images = [
    { id: `main-${work.id}`, imageUrl: work.imageURL },
    ...subWorks.map((subWork) => ({
      id: subWork.id,
      imageUrl: subWork.imageUrl ?? "",
    })),
  ]
  const first = images[entry.imageIndex]
  const ordered = first
    ? [first, ...images.filter((_, index) => index !== entry.imageIndex)]
    : images
  return {
    ...work,
    title: entry.title,
    enTitle: entry.title,
    description: entry.description,
    enDescription: entry.description,
    imageURL: ordered[0]?.imageUrl ?? work.imageURL,
    ...(work.subWorks && { subWorks: ordered.slice(1) }),
  }
}
