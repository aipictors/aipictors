/**
 * トップの「ランキング」タブの中身
 * GET /api/home-rankings?period=daily|weekly|monthly
 *
 * 全員同じ内容（未ログイン扱い・全年齢）なので、拠点のキャッシュに日付ごとに置いて使い回す。
 * タブを開いた人ごとに system へ問い合わせないようにする（順位は 1 日 1 回しか変わらない）
 */
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import {
  getLatestPublishedWeeklyPeriod,
  getPreviousWeeklyPeriod,
} from "~/utils/get-weeks-in-month"
import { getJstDate } from "~/utils/jst-date"

export type HomeRankingPeriod = "daily" | "weekly" | "monthly"

/** 表彰台 3 件 ＋ 番号つきの 17 件 */
const HOME_RANKING_LIMIT = 20

/** 拠点のキャッシュに置く時間（秒） */
const EDGE_CACHE_SECONDS = 60 * 60

const BROWSER_CACHE_CONTROL = "public, max-age=600"

const toPeriod = (value: string | null): HomeRankingPeriod =>
  value === "weekly" || value === "monthly" ? value : "daily"

type RankingWhere = {
  year: number
  month: number
  day?: number
  weekIndex?: number
}

const toHref = (where: RankingWhere) =>
  where.day !== undefined
    ? `/rankings/${where.year}/${where.month}/${where.day}`
    : where.weekIndex !== undefined
      ? `/rankings/${where.year}/${where.month}/weeks/${where.weekIndex}`
      : `/rankings/${where.year}/${where.month}`

/** 集計前で空なら 1 つ前の期間にさかのぼる（ランキングのページと同じ） */
const candidateWheres = (
  period: HomeRankingPeriod,
  now: Date,
): RankingWhere[] => {
  if (period === "daily") {
    return Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(now)
      date.setDate(now.getDate() - 1 - offset)
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      }
    })
  }
  if (period === "weekly") {
    const wheres: RankingWhere[] = []
    let current = getLatestPublishedWeeklyPeriod(now)
    for (let i = 0; i < 4; i += 1) {
      wheres.push({ ...current })
      current = getPreviousWeeklyPeriod(
        current.year,
        current.month,
        current.weekIndex,
      )
    }
    return wheres
  }
  return [1, 2].map((back) => {
    const date = new Date(now.getFullYear(), now.getMonth() - back, 1)
    return { year: date.getFullYear(), month: date.getMonth() + 1 }
  })
}

const loadRanking = async (period: HomeRankingPeriod, now: Date) => {
  const wheres = candidateWheres(period, now)
  for (const where of wheres) {
    const result = await loaderClient.query({
      query: homeRankingQuery,
      variables: { offset: 0, limit: HOME_RANKING_LIMIT, where },
    })
    const items = result.data?.workAwards ?? []
    if (items.length > 0 || where === wheres.at(-1)) {
      return { period, ...where, href: toHref(where), items }
    }
  }
  const last = wheres[0]
  return { period, ...last, href: toHref(last), items: [] }
}

export type HomeRankingResponse = Awaited<ReturnType<typeof loadRanking>>

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const period = toPeriod(url.searchParams.get("period"))
  const now = getJstDate()
  const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

  const cache = typeof caches === "undefined" ? null : caches.default
  const cacheKey = new Request(
    `https://www.aipictors.com/__home-rankings/v1/${period}/${dateKey}`,
  )
  const cached = await cache?.match(cacheKey).catch(() => undefined)
  if (cached) {
    const hit = new Response(cached.body, cached)
    hit.headers.set("cache-control", BROWSER_CACHE_CONTROL)
    return hit
  }

  let body: HomeRankingResponse
  try {
    body = await loadRanking(period, now)
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
  if (cache && body.items.length > 0) {
    const stored = response.clone()
    stored.headers.set("cache-control", `public, max-age=${EDGE_CACHE_SECONDS}`)
    await cache.put(cacheKey, stored).catch(() => {})
  }
  return response
}

const homeRankingQuery = graphql(
  `query HomeRanking($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      id
      snapshotLikedCount
      work {
        id
        title
        enTitle
        rating
        likesCount
        subWorksCount
        smallThumbnailImageURL
        smallThumbnailImageWidth
        largeThumbnailImageURL
        largeThumbnailImageWidth
        user {
          id
          name
          iconUrl
        }
      }
    }
  }`,
)
