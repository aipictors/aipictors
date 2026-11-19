import type { IntrospectionEnum } from "~/lib/introspection-enum"

export const TAG_PAGE_SIZE = 32

/**
 * API の tagWorks の offset の上限（64 * 24 = 1536 件）に合わせたページの上限（0 始まり）
 * 上限を超えた offset は上限に丸められるので、これより後ろのページは最後のページと同じ作品になる
 */
export const TAG_PAGE_OFFSET_MAX = 64 * 24

export const TAG_PAGE_MAX_PAGE = Math.floor(TAG_PAGE_OFFSET_MAX / TAG_PAGE_SIZE)

export type TagPageOrderBy = Extract<
  IntrospectionEnum<"WorkOrderBy">,
  | "LIKES_COUNT"
  | "DATE_CREATED"
  | "VIEWS_COUNT"
  | "BOOKMARKS_COUNT"
  | "COMMENTS_COUNT"
>

export type TagPageRating = "all" | "G" | "R15"

/**
 * 全年齢のメニューから開くページなので、既定は全年齢（G）だけにする
 * R15 も混ぜた一覧は「すべて」（rating=all）で開く
 */
export const TAG_PAGE_DEFAULT_RATING: TagPageRating = "G"

export type TagPageQuery = {
  page: number
  orderBy: TagPageOrderBy
  sort: "ASC" | "DESC"
  rating: TagPageRating
  hasPrompt: boolean
}

const TAG_PAGE_ORDERS: TagPageOrderBy[] = [
  "LIKES_COUNT",
  "DATE_CREATED",
  "VIEWS_COUNT",
  "BOOKMARKS_COUNT",
  "COMMENTS_COUNT",
]

const isOrderBy = (value: string | null): value is TagPageOrderBy =>
  value !== null && (TAG_PAGE_ORDERS as string[]).includes(value)

/**
 * タグページの URL のクエリ（並び順・絞り込み・ページ）を読む
 * 以前の URL（orderBy / sort / page / prompt / rating）と互換にする
 */
export function parseTagPageQuery(searchParams: URLSearchParams): TagPageQuery {
  const pageValue = Number.parseInt(searchParams.get("page") ?? "0", 10)
  const page =
    Number.isFinite(pageValue) && pageValue > 0
      ? Math.min(pageValue, TAG_PAGE_MAX_PAGE)
      : 0
  const orderByValue = searchParams.get("orderBy")
  const rating = searchParams.get("rating")
  return {
    page,
    orderBy: isOrderBy(orderByValue) ? orderByValue : "LIKES_COUNT",
    sort: searchParams.get("sort") === "ASC" ? "ASC" : "DESC",
    rating:
      rating === "all" || rating === "G" || rating === "R15"
        ? rating
        : TAG_PAGE_DEFAULT_RATING,
    hasPrompt: searchParams.get("prompt") === "1",
  }
}

/**
 * 並び替え・絞り込みのない一覧か（ページ送りは問わない）。
 * 並び替え・絞り込みの組み合わせは検索結果に出さず、リンクもたどらせない
 * （クローラーが組み合わせを開くたびに DB を読んでいた）
 */
export const isTagPageDefaultView = (query: TagPageQuery) =>
  query.orderBy === "LIKES_COUNT" &&
  query.sort === "DESC" &&
  query.rating === TAG_PAGE_DEFAULT_RATING &&
  !query.hasPrompt

export function toRatings(
  rating: TagPageRating,
): ("G" | "R15" | "R18" | "R18G")[] {
  if (rating === "G") return ["G"]
  if (rating === "R15") return ["R15"]
  return ["G", "R15"]
}

/**
 * クエリを URL の検索文字列にする（既定値は省いて URL を短く保つ）
 */
export function toTagPageSearch(query: Partial<TagPageQuery>): string {
  const params = new URLSearchParams()
  if (query.orderBy && query.orderBy !== "LIKES_COUNT") {
    params.set("orderBy", query.orderBy)
  }
  if (query.sort === "ASC") params.set("sort", "ASC")
  if (query.rating && query.rating !== TAG_PAGE_DEFAULT_RATING) {
    params.set("rating", query.rating)
  }
  if (query.hasPrompt) params.set("prompt", "1")
  if (query.page && query.page > 0) params.set("page", String(query.page))
  const search = params.toString()
  return search ? `?${search}` : ""
}
