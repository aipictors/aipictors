/**
 * モデルのおすすめプロンプトを、今のプロンプトに足す
 * すでに同じタグがあれば足さない（重みの付いた (tag:1.2) も同じタグとして見る）
 */

const normalizeTag = (tag: string) =>
  tag
    .replace(/:[\d.]+\s*\)?/g, "")
    .replace(/[()[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

const splitTags = (text: string) =>
  text
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "")

const findMissingTags = (current: string, recommended: string) => {
  const existing = new Set(splitTags(current).map(normalizeTag))
  return splitTags(recommended).filter((tag) => {
    const key = normalizeTag(tag)
    if (existing.has(key)) return false
    existing.add(key)
    return true
  })
}

/** 品質タグはプロンプトの先頭に足す */
export function addQualityPrompt(
  current: string,
  quality: string | null | undefined,
) {
  if (!quality) return current
  const missing = findMissingTags(current, quality)
  if (missing.length === 0) return current
  const head = missing.join(", ")
  return current.trim() === "" ? head : `${head}, ${current.trim()}`
}

/** ネガティブプロンプトは後ろに足す */
export function addNegativePrompt(
  current: string,
  negative: string | null | undefined,
) {
  if (!negative) return current
  const missing = findMissingTags(current, negative)
  if (missing.length === 0) return current
  const tail = missing.join(", ")
  return current.trim() === ""
    ? tail
    : `${current.trim().replace(/,$/, "")}, ${tail}`
}
