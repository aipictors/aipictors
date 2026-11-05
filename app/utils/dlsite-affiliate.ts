/**
 * DLsite アフィリエイト（ID: AIPICTORS）のリンク
 * マイページのリンク作成で出るものと同じ形にする。リンク経由ならどの作品が買われても報酬になる
 */
export const DLSITE_AFFILIATE_ID = "AIPICTORS"

const DLSITE_AI_FLOOR_URL = "https://www.dlsite.com/aix"

/** DLsite の URL をアフィリエイト経由のリンクにする */
export function toDlsiteAffiliateUrl(targetUrl: string) {
  return `https://dlaf.jp/home/dlaf/=/aid/${DLSITE_AFFILIATE_ID}/url/${encodeURIComponent(targetUrl)}`
}

/** AI 生成フロアのキーワード検索 */
export function toDlsiteAiSearchUrl(keyword: string) {
  return toDlsiteAffiliateUrl(
    `${DLSITE_AI_FLOOR_URL}/fsr/=/keyword/${encodeURIComponent(keyword.trim())}/`,
  )
}

/** AI 生成フロアの週間ランキング */
export function toDlsiteAiRankingUrl() {
  return toDlsiteAffiliateUrl(`${DLSITE_AI_FLOOR_URL}/ranking/week`)
}

/** どの作品にも付く広いタグは検索しても絞れないので使わない */
const GENERIC_TAGS = new Set(
  [
    "成人向け",
    "R18",
    "R-18",
    "R18G",
    "オリジナル",
    "AI",
    "AIイラスト",
    "AI生成",
    "AIアート",
    "NovelAI",
    "StableDiffusion",
    "Stable Diffusion",
  ].map((tag) => tag.toLowerCase()),
)

/** 検索に使うタグ（空・重複・広いタグを除いて先頭から） */
export function pickDlsiteSearchTags(tags: string[], max = 3) {
  const picked: string[] = []
  for (const tag of tags) {
    const name = tag.trim()
    if (
      name.length === 0 ||
      name.length > 30 ||
      picked.includes(name) ||
      GENERIC_TAGS.has(name.toLowerCase())
    )
      continue
    picked.push(name)
    if (picked.length >= max) break
  }
  return picked
}
