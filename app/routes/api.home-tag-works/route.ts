/**
 * トップの下の方の「タグごとの作品」
 * GET /api/home-tag-works
 *
 * 今日のお題と人気タグ 3 つについて、いいねの多い作品を横に並べる分だけ返す。
 * 全員同じ内容（全年齢）なので拠点のキャッシュに 1 時間置き、見た人ごとに system へ問い合わせない
 */
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { getJstDate } from "~/utils/jst-date"

/** 1 つのタグに並べる作品の数 */
const WORKS_PER_TAG = 12

/** 人気タグから出す数（今日のお題とあわせて最大 4 段） */
const POPULAR_TAG_COUNT = 3

const EDGE_CACHE_SECONDS = 60 * 60

const BROWSER_CACHE_CONTROL = "public, max-age=600"

export type HomeTagWorksRow = {
  tag: string
  enTag: string | null
  isTheme: boolean
  works: {
    id: string
    title: string
    enTitle: string | null
    likesCount: number
    smallThumbnailImageURL: string
    smallThumbnailImageWidth: number
    smallThumbnailImageHeight: number
  }[]
}

export type HomeTagWorksResponse = { rows: HomeTagWorksRow[] }

const loadRows = async (now: Date): Promise<HomeTagWorksResponse> => {
  const tagsResult = await loaderClient.query({
    query: homeTagWorksTagsQuery,
    variables: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    },
  })
  const theme = tagsResult.data?.dailyTheme
  const tags: Omit<HomeTagWorksRow, "works">[] = []
  if (theme?.title) {
    tags.push({ tag: theme.title, enTag: theme.enTitle ?? null, isTheme: true })
  }
  for (const tag of tagsResult.data?.recommendedTags ?? []) {
    if (tags.length >= POPULAR_TAG_COUNT + (theme?.title ? 1 : 0)) break
    if (!tag.tagName || tags.some((item) => item.tag === tag.tagName)) continue
    tags.push({
      tag: tag.tagName,
      enTag: tag.enTagName ?? null,
      isTheme: false,
    })
  }
  if (tags.length === 0) return { rows: [] }

  const where = (tag: string | undefined) => ({
    ratings: ["G" as const],
    isSensitive: false,
    isNowCreatedAt: true,
    search: tag ?? tags[0].tag,
    orderBy: "LIKES_COUNT" as const,
  })
  // 4 つのタグを 1 回の問い合わせで取る
  const worksResult = await loaderClient.query({
    query: homeTagWorksQuery,
    variables: {
      limit: WORKS_PER_TAG,
      where0: where(tags[0]?.tag),
      where1: where(tags[1]?.tag),
      where2: where(tags[2]?.tag),
      where3: where(tags[3]?.tag),
    },
  })
  const data = worksResult.data
  const lists = [data?.works0, data?.works1, data?.works2, data?.works3]
  return {
    rows: tags
      .map((tag, index) => ({ ...tag, works: lists[index] ?? [] }))
      .filter((row) => row.works.length > 0),
  }
}

export async function loader() {
  const now = getJstDate()
  const hourKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`

  const cache = typeof caches === "undefined" ? null : caches.default
  const cacheKey = new Request(
    `https://www.aipictors.com/__home-tag-works/v1/${hourKey}`,
  )
  const cached = await cache?.match(cacheKey).catch(() => undefined)
  if (cached) {
    const hit = new Response(cached.body, cached)
    hit.headers.set("cache-control", BROWSER_CACHE_CONTROL)
    return hit
  }

  let body: HomeTagWorksResponse
  try {
    body = await loadRows(now)
  } catch {
    return new Response(JSON.stringify({ error: "failed" }), {
      status: 502,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    })
  }

  const response = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": BROWSER_CACHE_CONTROL,
    },
  })
  if (cache && body.rows.length > 0) {
    const stored = response.clone()
    stored.headers.set("cache-control", `public, max-age=${EDGE_CACHE_SECONDS}`)
    await cache.put(cacheKey, stored).catch(() => {})
  }
  return response
}

const homeTagWorksTagsQuery = graphql(
  `query HomeTagWorksTags($year: Int!, $month: Int!, $day: Int!) {
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      enTitle
    }
    recommendedTags(limit: 6, where: { isSensitive: false }) {
      tagName
      enTagName
    }
  }`,
)

const HomeTagRowWorkFragment = graphql(
  `fragment HomeTagRowWork on WorkNode @_unmask {
    id
    title
    enTitle
    likesCount
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
  }`,
)

const homeTagWorksQuery = graphql(
  `query HomeTagWorks(
    $limit: Int!
    $where0: WorksWhereInput
    $where1: WorksWhereInput
    $where2: WorksWhereInput
    $where3: WorksWhereInput
  ) {
    works0: works(offset: 0, limit: $limit, where: $where0) {
      ...HomeTagRowWork
    }
    works1: works(offset: 0, limit: $limit, where: $where1) {
      ...HomeTagRowWork
    }
    works2: works(offset: 0, limit: $limit, where: $where2) {
      ...HomeTagRowWork
    }
    works3: works(offset: 0, limit: $limit, where: $where3) {
      ...HomeTagRowWork
    }
  }`,
  [HomeTagRowWorkFragment],
)
