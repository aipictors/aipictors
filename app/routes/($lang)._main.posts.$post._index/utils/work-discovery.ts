import type { FragmentOf } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

/**
 * 作品ページの下の一覧（おすすめ・前日ランキング・同じお題・同じモデル・新着・人気のタグ）。取得は work-discovery.server.ts
 */

export type DiscoveryRating = "G" | "R15" | "R18" | "R18G"

type DiscoveryWork = FragmentOf<typeof PhotoAlbumWorkFragment>

export type WorkDiscovery = {
  tagName: string | null
  tagWorks: DiscoveryWork[]
  awardDate: { year: number; month: number; day: number } | null
  awardWorks: DiscoveryWork[]
  theme: { title: string; dateText: string } | null
  themeWorks: DiscoveryWork[]
  /** 同じモデルの作品（モデルが分からない作品は null） */
  modelName: string | null
  modelWorks: DiscoveryWork[]
  newWorks: DiscoveryWork[]
  hotTags: string[]
}

/**
 * おすすめに使うタグ。同じ作品ページは毎回同じタグにする（配信のキャッシュと HTML がずれないように）。
 * 作品の番号でタグを散らして、同じ作者の作品が全部同じタグの一覧にならないようにする
 */
export function pickDiscoveryTag(
  workId: string,
  tagNames: string[],
): string | null {
  if (tagNames.length === 0) return null
  const seed = Number.parseInt(workId.replace(/\D/g, "").slice(-6) || "0", 10)
  return tagNames[seed % tagNames.length] ?? null
}

/** 全年齢の作品は全年齢、R15 の作品は全年齢と R15、R18 の作品は R18 と R18G を並べる */
export function toDiscoveryRatings(
  rating: DiscoveryRating | null,
): DiscoveryRating[] {
  if (rating === "R18" || rating === "R18G") return ["R18", "R18G"]
  if (rating === "R15") return ["G", "R15"]
  return ["G"]
}
