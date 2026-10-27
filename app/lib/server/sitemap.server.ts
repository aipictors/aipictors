import { config } from "~/config"
import { fetchPublicUserModels } from "~/lib/server/user-models.server"
import type { UserModel } from "~/lib/user-models/types"

/**
 * サイトマップの生成（/sitemap.xml と /sitemaps/*.xml）
 *
 * GraphQL の works は 1 回 64 件・offset 2000 までしか取れないため、
 * 作品は「投稿日（JST）ごと」に 1 ファイルに分け、beforeCreatedAt で日付を区切って取得する。
 * 過去の日のファイルはほとんど変わらないので長めにキャッシュする。
 */

export const SITE_URL = config.siteURL

/** 最初の作品が投稿された日（JST） */
const FIRST_WORK_DATE = "2022-11-08"

const PAGE_SIZE = 64
const MAX_OFFSET = 2000
const JST_OFFSET_SECONDS = 9 * 60 * 60

type SitemapUrl = {
  loc: string
  lastmod?: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly"
  priority?: number
  images?: { loc: string; title?: string }[]
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // XML 1.0 で使えない制御文字を取り除く
    // biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字の除去
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")

export function toUrlSetXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((url) => {
      const parts = [`<loc>${escapeXml(url.loc)}</loc>`]
      if (url.lastmod) parts.push(`<lastmod>${url.lastmod}</lastmod>`)
      if (url.changefreq) parts.push(`<changefreq>${url.changefreq}</changefreq>`)
      if (url.priority !== undefined) {
        parts.push(`<priority>${url.priority.toFixed(1)}</priority>`)
      }
      for (const image of url.images ?? []) {
        parts.push(
          `<image:image><image:loc>${escapeXml(image.loc)}</image:loc>${
            image.title
              ? `<image:title>${escapeXml(image.title.slice(0, 200))}</image:title>`
              : ""
          }</image:image>`,
        )
      }
      return `<url>${parts.join("")}</url>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`
}

export function toSitemapIndexXml(
  sitemaps: { loc: string; lastmod?: string }[],
): string {
  const body = sitemaps
    .map(
      (sitemap) =>
        `<sitemap><loc>${escapeXml(sitemap.loc)}</loc>${
          sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ""
        }</sitemap>`,
    )
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`
}

export function xmlResponse(xml: string, maxAgeSeconds: number): Response {
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${Math.min(maxAgeSeconds, 3600)}, s-maxage=${maxAgeSeconds}`,
      "X-Robots-Tag": "noindex",
    },
  })
}

/**
 * Workers のキャッシュ（caches.default）を使ってレスポンスを使い回す
 */
export async function withEdgeCache(
  request: Request,
  waitUntil: ((promise: Promise<unknown>) => void) | undefined,
  create: () => Promise<Response>,
): Promise<Response> {
  const cacheStorage =
    typeof caches !== "undefined"
      ? (caches as unknown as { default?: Cache }).default
      : undefined
  if (!cacheStorage || !import.meta.env.PROD) {
    return create()
  }
  const cacheKey = new Request(new URL(request.url).toString(), {
    method: "GET",
  })
  const cached = await cacheStorage.match(cacheKey)
  if (cached) {
    return cached
  }
  const response = await create()
  if (response.status === 200) {
    const put = cacheStorage.put(cacheKey, response.clone())
    if (waitUntil) {
      waitUntil(put)
    } else {
      await put
    }
  }
  return response
}

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  try {
    const response = await fetch(config.graphql.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
    })
    if (!response.ok) return null
    const json = (await response.json()) as { data?: T }
    return json.data ?? null
  } catch {
    return null
  }
}

/** JST の日付文字列（YYYY-MM-DD）の 0 時の unix 秒 */
export function jstDayStartSeconds(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00+09:00`) / 1000)
}

export function toJstDateString(unixSeconds: number): string {
  return new Date((unixSeconds + JST_OFFSET_SECONDS) * 1000)
    .toISOString()
    .slice(0, 10)
}

/** 最初の作品の日から今日（JST）までの日付の一覧（新しい順） */
export function listWorkSitemapDates(nowSeconds: number): string[] {
  const dates: string[] = []
  const first = jstDayStartSeconds(FIRST_WORK_DATE)
  const today = jstDayStartSeconds(toJstDateString(nowSeconds))
  for (let day = today; day >= first; day -= 24 * 60 * 60) {
    dates.push(toJstDateString(day))
  }
  return dates
}

export function isValidSitemapDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const start = jstDayStartSeconds(date)
  if (!Number.isFinite(start)) return false
  return (
    start >= jstDayStartSeconds(FIRST_WORK_DATE) &&
    start <= Date.now() / 1000 + 24 * 60 * 60
  )
}

type SitemapWork = {
  id: string
  title: string
  createdAt: number
  largeThumbnailImageURL: string
}

const dayWorksQuery = `query SitemapDayWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
  works(offset: $offset, limit: $limit, where: $where) {
    id
    title
    createdAt
    largeThumbnailImageURL
  }
}`

/**
 * その日（JST）に投稿された全年齢・R15 の公開作品
 */
export async function fetchWorksOfDay(date: string): Promise<SitemapWork[]> {
  const dayStart = jstDayStartSeconds(date)
  const dayEnd = dayStart + 24 * 60 * 60
  const works = new Map<string, SitemapWork>()

  // beforeCreatedAt は 9 時間ずれて解釈されるので、その分を足して渡す
  let cursor = dayEnd
  for (let round = 0; round < 6; round++) {
    const before = new Date((cursor + JST_OFFSET_SECONDS) * 1000).toISOString()
    let reachedDayStart = false
    let lastCreatedAt = cursor
    let lastPageFull = false

    // 作品の少ない日は 1 回で終わるので、最初は 1 ページだけ取り、足りなければまとめて取る
    const waveSizes = [1, 4, 8, 8, 8, 8]
    let offset = 0
    for (const waveSize of waveSizes) {
      if (offset > MAX_OFFSET) break
      const offsets = Array.from(
        { length: waveSize },
        (_, index) => offset + index * PAGE_SIZE,
      ).filter((value) => value <= MAX_OFFSET)
      offset += waveSize * PAGE_SIZE
      const pages = await Promise.all(
        offsets.map((pageOffset) =>
          graphqlRequest<{ works: SitemapWork[] }>(dayWorksQuery, {
            offset: pageOffset,
            limit: PAGE_SIZE,
            where: {
              ratings: ["G", "R15"],
              beforeCreatedAt: before,
              orderBy: "DATE_CREATED",
              sort: "DESC",
            },
          }),
        ),
      )
      for (const page of pages) {
        const items = page?.works ?? []
        lastPageFull = items.length === PAGE_SIZE
        for (const work of items) {
          if (work.createdAt < dayStart) {
            reachedDayStart = true
            continue
          }
          if (work.createdAt >= dayEnd) continue
          works.set(work.id, work)
          lastCreatedAt = Math.min(lastCreatedAt, work.createdAt)
        }
        if (!lastPageFull) {
          reachedDayStart = true
        }
      }
      if (reachedDayStart) break
    }

    if (reachedDayStart || !lastPageFull || lastCreatedAt >= cursor) break
    // offset の上限に達したので、いちばん古い作品の時刻から続きを取る
    cursor = lastCreatedAt + 1
  }

  return Array.from(works.values()).sort((a, b) => b.createdAt - a.createdAt)
}

const recommendedTagsQuery = `query SitemapTags($limit: Int!, $where: RecommendedTagsWhereInput!) {
  recommendedTags(limit: $limit, where: $where) {
    tagName
  }
}`

const hotTagsQuery = `query SitemapHotTags {
  hotTags { name }
  homeTags { name }
}`

export async function fetchSitemapTagNames(): Promise<string[]> {
  const [recommended, hot] = await Promise.all([
    graphqlRequest<{ recommendedTags: { tagName: string }[] }>(
      recommendedTagsQuery,
      { limit: 5000, where: { isSensitive: false } },
    ),
    graphqlRequest<{ hotTags: { name: string }[]; homeTags: { name: string }[] }>(
      hotTagsQuery,
      {},
    ),
  ])
  const names = [
    ...(hot?.hotTags ?? []).map((tag) => tag.name),
    ...(hot?.homeTags ?? []).map((tag) => tag.name),
    ...(recommended?.recommendedTags ?? []).map((tag) => tag.tagName),
  ]
  return Array.from(
    new Set(names.map((name) => name.trim()).filter((name) => name.length > 0)),
  )
}

const aiModelsQuery = `query SitemapAiModels {
  aiModels(offset: 0, limit: 300) {
    id
    name
  }
}`

export async function fetchSitemapAiModels(): Promise<
  { id: string; name: string }[]
> {
  const data = await graphqlRequest<{
    aiModels: { id: string; name: string }[] | null
  }>(aiModelsQuery, {})
  return data?.aiModels ?? []
}

/**
 * みんなのモデル（全年齢・R15 の公開中のもの）
 */
export async function fetchUserModelsForSitemap(context: unknown) {
  const models: UserModel[] = []
  for (let offset = 0; offset < 3000; offset += 60) {
    const page = await fetchPublicUserModels(
      context as Parameters<typeof fetchPublicUserModels>[0],
      { sort: "new", offset, limit: 60 },
    )
    models.push(...page.models)
    if (!page.hasMore || page.models.length === 0) break
  }
  return models
}
