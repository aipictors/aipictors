import { isIndexableSensitiveWork } from "~/utils/sensitive-tag-filter"

/**
 * IndexNow（Bing・Yandex など）に新しい作品のページを知らせる
 *
 * Bing は robots.txt で巡回の間隔を 10 秒にしているので、新しい作品が載るまで時間がかかる。
 * Worker の cron（wrangler.toml の triggers、毎時）で直近の作品の URL を送る。
 * 鍵は公開してよい値（public/<鍵>.txt に同じ値を置いて、このサイトのものだと示す）
 */
export const INDEXNOW_KEY = "1586526c1f5680e3fdd2ab271295ea0d"

const SITE_URL = "https://www.aipictors.com"
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
const PAGE_SIZE = 64

/** cron は毎時なので、取りこぼさないよう少し重ねて見る（重ねて送っても害はない） */
export const INDEXNOW_WINDOW_SECONDS = 65 * 60

type RecentWork = {
  id: string
  title: string
  createdAt: number
  rating?: string | null
  tagNames?: string[] | null
}

const recentWorksQuery = `query IndexNowRecentWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
  works(offset: $offset, limit: $limit, where: $where) {
    id
    title
    createdAt
    rating
    tagNames
  }
}`

const fetchRecentWorks = async (
  endpoint: string,
  isSensitive: boolean,
  offset: number,
): Promise<RecentWork[]> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: recentWorksQuery,
      variables: {
        offset,
        limit: PAGE_SIZE,
        where: {
          ...(isSensitive
            ? { ratings: ["R18"], isSensitive: true }
            : { ratings: ["G", "R15"] }),
          orderBy: "DATE_CREATED",
          sort: "DESC",
        },
      },
    }),
  })
  if (!response.ok) return []
  const json = (await response.json()) as { data?: { works?: RecentWork[] } }
  return json.data?.works ?? []
}

/**
 * 送る URL を選ぶ。公開済み（予約投稿の未来の時刻を除く）で直近のものだけ。
 * R18 は検索に載せられる作品だけ（R18G・未成年を連想させるタグやタイトルは除く）
 */
export function selectIndexNowUrls(
  works: { general: RecentWork[]; sensitive: RecentWork[] },
  nowSeconds: number,
): string[] {
  const isRecent = (work: RecentWork) =>
    work.createdAt <= nowSeconds &&
    work.createdAt > nowSeconds - INDEXNOW_WINDOW_SECONDS
  return [
    ...works.general
      .filter(isRecent)
      .map((work) => `${SITE_URL}/posts/${work.id}`),
    ...works.sensitive
      .filter((work) => isRecent(work) && isIndexableSensitiveWork(work))
      .map((work) => `${SITE_URL}/r/posts/${work.id}`),
  ]
}

export async function submitRecentWorksToIndexNow(
  graphqlEndpoint: string,
  nowSeconds: number,
): Promise<number> {
  // 混む時間でも 1 時間の投稿が収まるよう、全年齢は 2 ページ分見る
  const [general1, general2, sensitive] = await Promise.all([
    fetchRecentWorks(graphqlEndpoint, false, 0),
    fetchRecentWorks(graphqlEndpoint, false, PAGE_SIZE),
    fetchRecentWorks(graphqlEndpoint, true, 0),
  ])
  const urlList = selectIndexNowUrls(
    { general: [...general1, ...general2], sensitive },
    nowSeconds,
  )
  if (urlList.length === 0) return 0
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: "www.aipictors.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  })
  if (!response.ok && response.status !== 202) {
    console.warn("IndexNow", response.status, await response.text())
  }
  return urlList.length
}
