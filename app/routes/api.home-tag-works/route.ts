/**
 * トップの下の方の「タグごとの作品」
 * GET /api/home-tag-works（?sensitive=1 で R18 のトップ用）
 *
 * 今日のお題と人気タグ 3 つについて、いいねの多い作品を横に並べる分だけ返す。
 * 全員同じ内容（全年齢か R18 のどちらか）なので拠点のキャッシュに 1 時間置き、見た人ごとに system へ問い合わせない
 */
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { getJstDate } from "~/utils/jst-date"
import {
  isFeaturableSensitiveTag,
  isFeaturableSensitiveWork,
} from "~/utils/sensitive-tag-filter"

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

const loadRows = async (
  now: Date,
  isSensitive: boolean,
): Promise<HomeTagWorksResponse> => {
  const tagsResult = await loaderClient.query({
    query: isSensitive ? homeTagWorksSensitiveTagsQuery : homeTagWorksTagsQuery,
    variables: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    },
  })
  // R18 では、ガイドラインに触れそうなタグは選んで見せる枠に出さない（R18 のトップの他の欄と同じ）
  const isShownTag = (name: string) =>
    !isSensitive || isFeaturableSensitiveTag(name)
  const theme =
    tagsResult.data?.dailyTheme?.title &&
    isShownTag(tagsResult.data.dailyTheme.title)
      ? tagsResult.data.dailyTheme
      : null
  const tags: Omit<HomeTagWorksRow, "works">[] = []
  if (theme?.title) {
    tags.push({ tag: theme.title, enTag: theme.enTitle ?? null, isTheme: true })
  }
  for (const tag of tagsResult.data?.recommendedTags ?? []) {
    if (tags.length >= POPULAR_TAG_COUNT + (theme?.title ? 1 : 0)) break
    if (!tag.tagName || tags.some((item) => item.tag === tag.tagName)) continue
    if (!isShownTag(tag.tagName)) continue
    tags.push({
      tag: tag.tagName,
      enTag: tag.enTagName ?? null,
      isTheme: false,
    })
  }
  if (tags.length === 0) return { rows: [] }

  // 新しい作品を出す: お題は同じ言葉のお題が過去にもある（例: 昨年の「ケチャップ」）ので、ここ 3 日の作品を新しい順に。
  // ほかのタグはこの 30 日の作品をいいね順に（全期間のいいね順だと昔の作品ばかりになる）
  const where = (row: Omit<HomeTagWorksRow, "works"> | undefined) => {
    const target = row ?? tags[0]
    return {
      ratings: isSensitive ? ["R18" as const] : ["G" as const],
      isSensitive,
      isNowCreatedAt: true,
      search: target.tag,
      orderBy: target.isTheme
        ? ("DATE_CREATED" as const)
        : ("LIKES_COUNT" as const),
      createdAtAfter: toDaysAgoIso(target.isTheme ? 3 : 30),
    }
  }
  const variables = {
    limit: WORKS_PER_TAG,
    where0: where(tags[0]),
    where1: where(tags[1]),
    where2: where(tags[2]),
    where3: where(tags[3]),
  }
  // 4 つのタグを 1 回の問い合わせで取る
  const lists: HomeTagWorksRow["works"][] = []
  if (isSensitive) {
    const data = (
      await loaderClient.query({ query: homeTagWorksSensitiveQuery, variables })
    ).data
    for (const list of [
      data?.works0,
      data?.works1,
      data?.works2,
      data?.works3,
    ]) {
      // R18G は混ぜない（ratings を R18 にしても検索では R18G が返ることがある）。タグ名と評価は選ぶのに使うだけで返さない
      lists.push(
        (list ?? [])
          .filter(
            (work) => work.rating === "R18" && isFeaturableSensitiveWork(work),
          )
          .map(({ tagNames: _tagNames, rating: _rating, ...work }) => work),
      )
    }
  } else {
    const data = (
      await loaderClient.query({ query: homeTagWorksQuery, variables })
    ).data
    lists.push(
      data?.works0 ?? [],
      data?.works1 ?? [],
      data?.works2 ?? [],
      data?.works3 ?? [],
    )
  }
  return {
    rows: tags
      .map((tag, index) => ({ ...tag, works: lists[index] ?? [] }))
      .filter((row) => row.works.length > 0),
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

/** 日付の切れ目にそろえた N 日前（時刻を丸めて、1 時間のキャッシュの中で同じ問い合わせになるように） */
const toDaysAgoIso = (days: number) =>
  new Date(
    Math.floor(Date.now() / DAY_MS) * DAY_MS - days * DAY_MS,
  ).toISOString()

export async function loader({ request }: LoaderFunctionArgs) {
  const isSensitive = new URL(request.url).searchParams.get("sensitive") === "1"
  const now = getJstDate()
  const hourKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}`

  const cache = typeof caches === "undefined" ? null : caches.default
  const cacheKey = new Request(
    `https://www.aipictors.com/__home-tag-works/v2/${isSensitive ? "r18/" : ""}${hourKey}`,
  )
  const cached = await cache?.match(cacheKey).catch(() => undefined)
  if (cached) {
    const hit = new Response(cached.body, cached)
    hit.headers.set("cache-control", BROWSER_CACHE_CONTROL)
    return hit
  }

  let body: HomeTagWorksResponse
  try {
    body = await loadRows(now, isSensitive)
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

const homeTagWorksSensitiveTagsQuery = graphql(
  `query HomeTagWorksSensitiveTags($year: Int!, $month: Int!, $day: Int!) {
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      enTitle
    }
    recommendedTags(limit: 12, where: { isSensitive: true }) {
      tagName
      enTagName
    }
  }`,
)

const homeTagWorksSensitiveQuery = graphql(
  `query HomeTagWorksSensitive(
    $limit: Int!
    $where0: WorksWhereInput
    $where1: WorksWhereInput
    $where2: WorksWhereInput
    $where3: WorksWhereInput
  ) {
    works0: works(offset: 0, limit: $limit, where: $where0) {
      ...HomeTagRowWork
      rating
      tagNames
    }
    works1: works(offset: 0, limit: $limit, where: $where1) {
      ...HomeTagRowWork
      rating
      tagNames
    }
    works2: works(offset: 0, limit: $limit, where: $where2) {
      ...HomeTagRowWork
      rating
      tagNames
    }
    works3: works(offset: 0, limit: $limit, where: $where3) {
      ...HomeTagRowWork
      rating
      tagNames
    }
  }`,
  [HomeTagRowWorkFragment],
)
