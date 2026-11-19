/** モデルの作品一覧の 1 ページの件数（取得の limit とページ送りの両方で使う） */
export const AI_MODEL_WORKS_PER_PAGE = 32

/**
 * API の aiModel.works の offset の上限（64 * 16 = 1024 件）
 * 上限を超えた offset は上限に丸められるので、これより後ろのページは最後のページと同じ作品になる
 */
export const AI_MODEL_WORKS_OFFSET_MAX = 64 * 16

/** ページの上限（0 始まり） */
export const AI_MODEL_WORKS_MAX_PAGE = Math.floor(
  AI_MODEL_WORKS_OFFSET_MAX / AI_MODEL_WORKS_PER_PAGE,
)

/** 並び順（new は投稿日の新しい順、likes はいいねの多い順） */
export type AiModelWorksSort = "new" | "likes"

/**
 * 一覧の条件（URL のクエリ）
 * - page: 0 始まり（?page=1 が 2 ページ目。以前からの URL をそのまま開けるようにする）
 * - prompt: プロンプトを公開している作品だけ
 * - more: 全年齢は R15 も含める（?r15=1）、R18 は R18G も含める（?r18g=1）
 * - sort: 並び順（?sort=likes、既定の新着は付けない）
 */
export type AiModelWorksSearch = {
  page: number
  hasPrompt: boolean
  isMoreRatings: boolean
  sort: AiModelWorksSort
}

export const parseAiModelWorksSearch = (
  searchParams: URLSearchParams,
  moreRatingsKey: "r15" | "r18g",
): AiModelWorksSearch => {
  const page = Number.parseInt(searchParams.get("page") ?? "", 10)
  return {
    page:
      Number.isFinite(page) && page > 0
        ? Math.min(page, AI_MODEL_WORKS_MAX_PAGE)
        : 0,
    hasPrompt: searchParams.get("prompt") === "1",
    isMoreRatings: searchParams.get(moreRatingsKey) === "1",
    sort: searchParams.get("sort") === "likes" ? "likes" : "new",
  }
}

/**
 * 一覧の URL のクエリ（既定の値は付けないので、同じ一覧の URL が 1 つにまとまる）
 */
export const toAiModelWorksQuery = (
  search: AiModelWorksSearch,
  moreRatingsKey: "r15" | "r18g",
) => {
  const params = new URLSearchParams()
  if (search.page > 0) params.set("page", String(search.page))
  if (search.hasPrompt) params.set("prompt", "1")
  if (search.isMoreRatings) params.set(moreRatingsKey, "1")
  if (search.sort !== "new") params.set("sort", search.sort)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export const toAiModelWorksOrderBy = (sort: AiModelWorksSort) => {
  return sort === "likes" ? ("LIKES_COUNT" as const) : ("DATE_CREATED" as const)
}

/** ページ数（作品がなくても 1 ページ、API でさかのぼれるところまで） */
export const toAiModelWorksPageCount = (worksCount: number) => {
  return Math.min(
    AI_MODEL_WORKS_MAX_PAGE + 1,
    Math.max(1, Math.ceil(worksCount / AI_MODEL_WORKS_PER_PAGE)),
  )
}

/**
 * ページ送りに出すページ番号（0 始まり）。間を省くところは null
 * 例: 全 10 ページの 5 ページ目 → 0, null, 3, 4, 5, null, 9
 */
export const toAiModelWorksPageItems = (
  currentPage: number,
  pageCount: number,
): (number | null)[] => {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index)
  }
  const start = Math.max(1, Math.min(currentPage - 1, pageCount - 4))
  const end = Math.min(pageCount - 2, Math.max(currentPage + 1, 3))
  const items: (number | null)[] = [0]
  if (start > 1) items.push(null)
  for (let page = start; page <= end; page++) items.push(page)
  if (end < pageCount - 2) items.push(null)
  items.push(pageCount - 1)
  return items
}

/** 作品のタグを数えて、よく使われている順に返す */
export const toAiModelPopularTags = (
  works: { tags: { name: string }[] }[],
  limit: number,
) => {
  const counts = new Map<string, number>()
  for (const work of works) {
    for (const tag of work.tags) {
      const name = tag.name.trim()
      if (name.length === 0) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}
