import type { WorkTextSearchOrder } from "~/lib/server/work-text-search.server"
import { getLocalePrefix } from "~/routes/($lang)._main._index/utils/content-rating-path"

export type SearchRatingFilter = "G" | "R15" | "R18"
export type SearchStyleFilter = "all" | "ILLUSTRATION" | "REAL"
export type SearchPromptFilter = "all" | "with" | "without"
export type SearchOrderFilter = WorkTextSearchOrder

export const RESULTS_LIMIT = 30
/** タイトル・説明の検索で開けるページの上限（0 始まり） */
export const TEXT_SEARCH_MAX_PAGE = 29
export const SIDEBAR_RANKING_LIMIT = 7

export const normalizeTagQuery = (value?: string | null) => {
  if (!value) {
    return null
  }

  // 全角の「＃」も外す（スマホの入力では全角になりやすい）
  const normalized = value
    .trim()
    .replace(/^[#＃]+/, "")
    .trim()
  return normalized.length > 0 ? normalized : null
}

export const getRatingFilter = (
  value: string | null,
  isSensitiveMode: boolean,
): SearchRatingFilter => {
  if (value === "G" || value === "R15" || value === "R18") {
    return value
  }

  return isSensitiveMode ? "R18" : "G"
}

/** 検索の URL。R18 の絞り込みは /r/search、全年齢と R-15 は /search に分ける */
export const getSearchBasePath = (pathname: string, rating: "R18" | "all") =>
  `${getLocalePrefix(pathname)}${rating === "R18" ? "/r" : ""}/search`

export const getStyleFilter = (value: string | null): SearchStyleFilter => {
  if (value === "ILLUSTRATION" || value === "REAL") {
    return value
  }

  return "all"
}

export const getPromptFilter = (value: string | null): SearchPromptFilter => {
  if (value === "with" || value === "without") {
    return value
  }

  return "all"
}

export const getOrderFilter = (value: string | null): SearchOrderFilter => {
  if (value === "new" || value === "old") {
    return value
  }

  return "popular"
}

/** 「自分の作品のみ」の相手。ページはキャッシュするので、ログイン情報ではなく URL で受ける */
export const getUserFilter = (value: string | null) =>
  value !== null && /^\d+$/.test(value) ? value : null

export const getCurrentPage = (value: string | null) => {
  const parsed = Number(value ?? "0")

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return Math.floor(parsed)
}

export const buildWorksWhere = (props: {
  tagQuery?: string | null
  rating: SearchRatingFilter
  style: SearchStyleFilter
  prompt: SearchPromptFilter
  order?: SearchOrderFilter
  userId?: string | null
}) => {
  const order = props.order ?? "popular"
  const where: Record<string, unknown> = {
    ratings: [props.rating],
    orderBy: order === "popular" ? "LIKES_COUNT" : "DATE_CREATED",
    sort: order === "old" ? "ASC" : "DESC",
  }

  if (props.userId) {
    where.userId = props.userId
  }

  if (props.tagQuery) {
    where.tagNames = [props.tagQuery]
  }

  if (props.style !== "all") {
    where.style = props.style
  }

  if (props.prompt === "with") {
    where.hasPrompt = true
  }

  if (props.prompt === "without") {
    where.hasPrompt = false
  }

  return where
}

export type SearchFilters = {
  order: SearchOrderFilter
  prompt: SearchPromptFilter
  rating: SearchRatingFilter
  style: SearchStyleFilter
  userId: string | null
}

/** 絞り込みの変更（mode の null は「自動で決める」） */
export type SearchFilterChange = Partial<SearchFilters> & {
  page?: number
  mode?: "tag" | "text" | null
}

/**
 * 今の条件に変更を足して、URL のパラメータを作る
 */
export const buildSearchFilterParams = (
  data: { mode: "tag" | "text"; filters: SearchFilters },
  next?: SearchFilterChange,
) => {
  const params = new URLSearchParams()
  const mode = next?.mode === undefined ? data.mode : next.mode
  if (mode === "text") {
    params.set("mode", "text")
  } else if (mode === "tag") {
    // 指定がないとキーワードの部分一致になるので、タグの一致は明示する
    params.set("mode", "tag")
  }
  const rating = next?.rating ?? data.filters.rating
  const style = next?.style ?? data.filters.style
  const prompt = next?.prompt ?? data.filters.prompt
  const order = next?.order ?? data.filters.order
  const userId = next?.userId === undefined ? data.filters.userId : next.userId
  const page = next?.page ?? 0

  params.set("age_limit", rating === "R15" ? "R15" : "")

  if (order !== "popular") {
    params.set("order", order)
  }

  if (userId) {
    params.set("user", userId)
  }

  if (style !== "all") {
    params.set("style", style)
  }

  if (prompt !== "all") {
    params.set("prompt", prompt)
  }

  if (page > 0) {
    params.set("page", String(page))
  }

  return params
}

/**
 * 指定がなければキーワードの部分一致（タイトル・説明・タグ）を出す。
 * 部分一致で 1 件もなく、タグの完全一致だけあるときはタグの結果を出す
 */
export const chooseSearchMode = (props: {
  textResult: { count: number } | null
  requestedMode: string | null
  tagWorksCount: number
}): "tag" | "text" => {
  const { textResult, requestedMode, tagWorksCount } = props
  return textResult === null
    ? "tag"
    : requestedMode === "tag"
      ? "tag"
      : requestedMode === "text" || textResult.count > 0 || tagWorksCount === 0
        ? "text"
        : "tag"
}

/**
 * 結果の作品に多いタグ（検索した言葉は除く）
 */
export const collectRelatedTags = (
  works: { tagNames?: string[] | null }[],
  searchQuery: string | null,
) => {
  const relatedTagCounts = new Map<string, number>()
  for (const work of works) {
    for (const name of new Set(work.tagNames ?? [])) {
      const trimmed = name.trim()
      if (!trimmed || trimmed.toLowerCase() === searchQuery?.toLowerCase()) {
        continue
      }
      relatedTagCounts.set(trimmed, (relatedTagCounts.get(trimmed) ?? 0) + 1)
    }
  }
  return Array.from(relatedTagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([name]) => name)
}
