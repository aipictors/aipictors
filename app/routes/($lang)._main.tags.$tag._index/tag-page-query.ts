import type { IntrospectionEnum } from "~/lib/introspection-enum"

export const TAG_PAGE_SIZE = 32

/** API の offset の上限（2000 件）に合わせたページの上限（0 始まり） */
export const TAG_PAGE_MAX_PAGE = Math.floor(2000 / TAG_PAGE_SIZE)

export type TagPageOrderBy = Extract<
  IntrospectionEnum<"WorkOrderBy">,
  | "LIKES_COUNT"
  | "DATE_CREATED"
  | "VIEWS_COUNT"
  | "BOOKMARKS_COUNT"
  | "COMMENTS_COUNT"
>

export type TagPageRating = "all" | "G" | "R15"

export type TagPageQuery = {
  page: number
  orderBy: TagPageOrderBy
  sort: "ASC" | "DESC"
  rating: TagPageRating
  hasPrompt: boolean
}

export const TAG_PAGE_ORDERS: TagPageOrderBy[] = [
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
    rating: rating === "G" || rating === "R15" ? rating : "all",
    hasPrompt: searchParams.get("prompt") === "1",
  }
}

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
  if (query.rating && query.rating !== "all") params.set("rating", query.rating)
  if (query.hasPrompt) params.set("prompt", "1")
  if (query.page && query.page > 0) params.set("page", String(query.page))
  const search = params.toString()
  return search ? `?${search}` : ""
}
