/**
 * 呪文まとめの集計（人気作品の呪文から、よく使われる語・モデル・一緒に付くタグを数える）
 * ローダーで 1 回だけ計算し、結果を HTML に入れる（配信のキャッシュに 1 日載る）
 */

/** 画質・画風の指定（中身の語と分けて見せる） */
const QUALITY_TOKENS = new Set([
  "masterpiece",
  "best quality",
  "high quality",
  "highest quality",
  "top quality",
  "amazing quality",
  "great quality",
  "good quality",
  "normal quality",
  "very aesthetic",
  "aesthetic",
  "absurdres",
  "highres",
  "high resolution",
  "ultra detailed",
  "ultra-detailed",
  "extremely detailed",
  "highly detailed",
  "very detailed",
  "detailed",
  "intricate details",
  "highest detailed",
  "best illustration",
  "illustration",
  "official art",
  "newest",
  "recent",
  "rating: general",
  "rating:general",
  "safe",
  "8k",
  "4k",
  "8k wallpaper",
  "8k resolution",
  "4k resolution",
  "hdr",
  "uhd",
  "extremely detailed cg unity 8k wallpaper",
  "unity 8k wallpaper",
  "ultra high res",
  "photorealistic",
  "realistic",
  "anime coloring",
  "anime screencap",
  "depth of field",
  "cinematic lighting",
  "beautiful detailed eyes",
  "detailed eyes",
  "detailed face",
  "perfect anatomy",
  "sharp focus",
  "score_9",
  "score_8_up",
  "score_7_up",
])

/** 数えない語（呪文の書式・意味のない語） */
const IGNORED_TOKENS = new Set(["break", "and", "solo focus", "none", "null"])

/**
 * 呪文の 1 語を数えやすい形にそろえる（強調の括弧・重み・LoRA 指定を外す）
 */
export function normalizePromptToken(raw: string): string | null {
  let token = raw
    .normalize("NFKC")
    // <lora:name:0.8> などの指定は語として数えない
    .replace(/<[^>]*>/g, " ")
    .replace(/\\([()[\]{}])/g, "$1")
    // (word:1.2) の重み
    .replace(/:\s*-?\d+(?:\.\d+)?\s*(?=[)\]}]|$)/g, "")
    .replace(/[()[\]{}]/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
  token = token.replace(/^[-–—・.*'"`]+|[-–—・.*'"`]+$/g, "").trim()
  if (token.length < 2 || token.length > 40) return null
  if (/^[\d.\s:x×]+$/.test(token)) return null
  if (IGNORED_TOKENS.has(token)) return null
  return token
}

export function splitPrompt(prompt: string): string[] {
  const tokens = prompt
    .split(/[,\n、，|]+/)
    .map(normalizePromptToken)
    .filter((token): token is string => token !== null)
  return Array.from(new Set(tokens))
}

export const isQualityToken = (token: string) =>
  QUALITY_TOKENS.has(token) || /^score[ _]\d/.test(token)

export type TokenCount = { token: string; count: number; share: number }

type PromptWork = {
  prompt?: string | null
  negativePrompt?: string | null
}

/**
 * 呪文に含まれる語を作品数で数える（1 作品で同じ語を何度書いても 1 回）
 */
export function aggregatePromptTokens(
  works: PromptWork[],
  options: { limit?: number; qualityLimit?: number; negativeLimit?: number } = {},
) {
  const content = new Map<string, number>()
  const quality = new Map<string, number>()
  const negative = new Map<string, number>()
  let promptCount = 0
  let negativeCount = 0
  for (const work of works) {
    const tokens = splitPrompt(work.prompt ?? "")
    if (tokens.length > 0) promptCount += 1
    for (const token of tokens) {
      const target = isQualityToken(token) ? quality : content
      target.set(token, (target.get(token) ?? 0) + 1)
    }
    const negativeTokens = splitPrompt(work.negativePrompt ?? "")
    if (negativeTokens.length > 0) negativeCount += 1
    for (const token of negativeTokens) {
      negative.set(token, (negative.get(token) ?? 0) + 1)
    }
  }
  const toList = (counts: Map<string, number>, total: number, limit: number) =>
    Array.from(counts.entries())
      // 1 作品だけの語は、その作品の固有の指定なので載せない
      .filter(([, count]) => count >= 2 || total < 6)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([token, count]) => ({
        token,
        count,
        share: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
  return {
    promptCount,
    content: toList(content, promptCount, options.limit ?? 30),
    quality: toList(quality, promptCount, options.qualityLimit ?? 12),
    negative: toList(negative, negativeCount, options.negativeLimit ?? 15),
  }
}

/**
 * 作品に使われたモデルを数える
 */
export function aggregateModels(
  works: { model?: string | null }[],
  options: { limit?: number; isBlocked?: (name: string) => boolean } = {},
) {
  const counts = new Map<string, number>()
  for (const work of works) {
    const name = work.model?.trim()
    if (!name || options.isBlocked?.(name)) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, options.limit ?? 8)
    .map(([name, count]) => ({ name, count }))
}

/**
 * 一緒に付けられているタグを数える
 */
export function aggregateRelatedTags(
  works: { tagNames?: readonly string[] | null }[],
  current: string,
  options: { limit?: number; isBlocked?: (name: string) => boolean } = {},
) {
  const counts = new Map<string, number>()
  const currentKey = current.normalize("NFKC").toLowerCase()
  for (const work of works) {
    for (const raw of new Set(work.tagNames ?? [])) {
      const name = raw.trim()
      if (!name || name.normalize("NFKC").toLowerCase() === currentKey) continue
      if (options.isBlocked?.(name)) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2 || works.length < 8)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, options.limit ?? 20)
    .map(([name, count]) => ({ name, count }))
}

/**
 * 呪文の例として見せる長さにそろえる
 */
export function toPromptExcerpt(prompt: string, maxLength = 360): string {
  const text = prompt
    .replace(/<[^>]*>/g, "")
    .replace(/\s*\n\s*/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/(?:,\s*){2,}/g, ", ")
    .trim()
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastComma = cut.lastIndexOf(",")
  return `${(lastComma > maxLength * 0.6 ? cut.slice(0, lastComma) : cut).trim()} …`
}
