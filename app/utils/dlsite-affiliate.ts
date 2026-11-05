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

/** 作品ページ（AI 生成フロア） */
export function toDlsiteWorkUrl(workno: string) {
  return toDlsiteAffiliateUrl(
    `${DLSITE_AI_FLOOR_URL}/work/=/product_id/${encodeURIComponent(workno)}.html`,
  )
}

export type DlsiteWork = {
  workno: string
  name: string
  maker: string
  rank: number | null
  imageUrl: string
}

type DlsiteRawWork = {
  workno?: unknown
  work_name?: unknown
  maker_name?: unknown
  ranking?: unknown
  image_main?: { resize_url?: unknown; url?: unknown } | null
}

/**
 * 公式ブログパーツと同じランキング API（/aix/api/=/ranking.json）の中身から、表示に使うところだけ残す
 * 画像はブログパーツの大サイズと同じ 300x300 の縮小版
 */
export function toDlsiteWorks(raw: unknown, max = 30): DlsiteWork[] {
  if (!Array.isArray(raw)) return []
  const works: DlsiteWork[] = []
  for (const item of raw as DlsiteRawWork[]) {
    const workno = typeof item?.workno === "string" ? item.workno : ""
    const name = typeof item?.work_name === "string" ? item.work_name : ""
    const resize = item?.image_main?.resize_url
    const original = item?.image_main?.url
    const image =
      typeof resize === "string" && resize.length > 0
        ? `https://img.dlsite.jp/${resize}_300x300.jpg`
        : typeof original === "string" && original.startsWith("//")
          ? `https:${original}`
          : ""
    if (!/^[A-Z]{2}\d+$/.test(workno) || name.length === 0 || image === "")
      continue
    works.push({
      workno,
      name,
      maker: typeof item.maker_name === "string" ? item.maker_name : "",
      rank: typeof item.ranking === "number" ? item.ranking : null,
      imageUrl: image,
    })
    if (works.length >= max) break
  }
  return works
}
