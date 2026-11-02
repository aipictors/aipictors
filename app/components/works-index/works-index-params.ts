/** 一覧の 1 ページの作品数 */
export const WORKS_INDEX_PER_PAGE = 24

/** 開ける最後のページ（深いページは API が遅くなるので、サイトの他の一覧と同じ上限にする） */
export const WORKS_INDEX_MAX_PAGE = 63

/**
 * URL の ?page= を読む（サイトの他の一覧と同じ 0 始まり。?page=1 が 2 ページ目）
 */
export const parseWorksIndexPage = (value: string | null) => {
  if (value === null || !/^\d+$/.test(value)) return 0
  const page = Number.parseInt(value, 10)
  return Number.isSafeInteger(page) ? page : 0
}

/**
 * 作品数から最後のページ（0 始まり）を出す
 */
export const toLastPage = (count: number) => {
  const last = Math.ceil(count / WORKS_INDEX_PER_PAGE) - 1
  return Math.min(Math.max(last, 0), WORKS_INDEX_MAX_PAGE)
}

/**
 * ページ番号の並び（0 始まり）。間は "gap" で省く
 * スマホの幅に収まるように、最大で 7 個にする
 */
export const toPageItems = (page: number, lastPage: number) => {
  if (lastPage <= 6) {
    return Array.from({ length: lastPage + 1 }, (_, index) => index)
  }
  const start = page <= 2 ? 1 : page >= lastPage - 2 ? lastPage - 3 : page - 1
  const end = page <= 2 ? 3 : page >= lastPage - 2 ? lastPage - 1 : page + 1
  const items: (number | "gap")[] = [0]
  if (start > 1) items.push("gap")
  for (let index = start; index <= end; index++) items.push(index)
  if (end < lastPage - 1) items.push("gap")
  items.push(lastPage)
  return items
}

/**
 * 一覧の URL のクエリを作る（既定の値は URL に残さない）
 */
export const toWorksIndexSearch = (params: {
  sort?: string | null
  q?: string | null
  page?: number
}) => {
  const search = new URLSearchParams()
  if (params.q) search.set("q", params.q)
  if (params.sort) search.set("sort", params.sort)
  if (params.page) search.set("page", String(params.page))
  const text = search.toString()
  return text === "" ? "" : `?${text}`
}

/**
 * 作品の説明から、カードに出す抜粋を作る
 * URL・Markdown の記号・改行を除き、HTML が大きくならないように短くする
 */
export const toWorkExcerpt = (description: string | null, maxLength = 90) => {
  if (!description) return ""
  const text = description
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_`#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}
