import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  fetchSitemapAiModels,
  fetchSitemapTagNames,
  fetchUserModelsForSitemap,
  fetchWorksOfDay,
  isValidSitemapDate,
  jstDayStartSeconds,
  SITE_URL,
  toJstDateString,
  toUrlSetXml,
  withEdgeCache,
  xmlResponse,
} from "~/lib/server/sitemap.server"

/** よく見られる固定ページ */
const STATIC_PAGES: {
  path: string
  changefreq: "hourly" | "daily" | "weekly" | "monthly"
  priority: number
}[] = [
  { path: "/", changefreq: "hourly", priority: 1 },
  { path: "/posts", changefreq: "hourly", priority: 0.9 },
  { path: "/new-works", changefreq: "hourly", priority: 0.8 },
  { path: "/rankings", changefreq: "daily", priority: 0.8 },
  { path: "/ai-rankings", changefreq: "daily", priority: 0.6 },
  { path: "/tags", changefreq: "daily", priority: 0.8 },
  { path: "/search", changefreq: "daily", priority: 0.6 },
  { path: "/themes", changefreq: "daily", priority: 0.7 },
  { path: "/models", changefreq: "daily", priority: 0.8 },
  { path: "/events", changefreq: "weekly", priority: 0.6 },
  { path: "/posts/2d", changefreq: "daily", priority: 0.7 },
  { path: "/posts/2.5d", changefreq: "daily", priority: 0.7 },
  { path: "/posts/3d", changefreq: "daily", priority: 0.7 },
  { path: "/novels", changefreq: "daily", priority: 0.5 },
  { path: "/collections", changefreq: "weekly", priority: 0.5 },
  { path: "/stickers", changefreq: "weekly", priority: 0.5 },
  { path: "/generation", changefreq: "weekly", priority: 0.7 },
  { path: "/generation/about", changefreq: "monthly", priority: 0.5 },
  { path: "/plus", changefreq: "monthly", priority: 0.4 },
  { path: "/releases", changefreq: "weekly", priority: 0.5 },
  { path: "/about", changefreq: "monthly", priority: 0.5 },
  { path: "/help", changefreq: "monthly", priority: 0.4 },
  { path: "/guideline", changefreq: "monthly", priority: 0.3 },
  { path: "/presskit", changefreq: "monthly", priority: 0.3 },
  { path: "/terms", changefreq: "monthly", priority: 0.2 },
  { path: "/privacy", changefreq: "monthly", priority: 0.2 },
]

const ONE_HOUR = 60 * 60
const ONE_DAY = 24 * ONE_HOUR

/**
 * 個別のサイトマップ
 * - /sitemaps/pages.xml 固定ページ
 * - /sitemaps/tags.xml 人気のタグ
 * - /sitemaps/models.xml 公式モデル・みんなのモデル
 * - /sitemaps/works-YYYY-MM-DD.xml その日（JST）に投稿された作品
 */
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const name = params.name ?? ""
  const waitUntil = context.cloudflare?.ctx?.waitUntil?.bind(
    context.cloudflare.ctx,
  )

  if (name === "pages.xml") {
    return xmlResponse(
      toUrlSetXml(
        STATIC_PAGES.map((page) => ({
          loc: `${SITE_URL}${page.path === "/" ? "/" : page.path}`,
          changefreq: page.changefreq,
          priority: page.priority,
        })),
      ),
      ONE_DAY,
    )
  }

  if (name === "tags.xml") {
    return withEdgeCache(request, waitUntil, async () => {
      const tagNames = await fetchSitemapTagNames()
      return xmlResponse(
        toUrlSetXml(
          tagNames.map((tagName) => ({
            loc: `${SITE_URL}/tags/${encodeURIComponent(tagName)}`,
            changefreq: "daily",
            priority: 0.7,
          })),
        ),
        ONE_DAY,
      )
    })
  }

  if (name === "models.xml") {
    return withEdgeCache(request, waitUntil, async () => {
      const [aiModels, userModels] = await Promise.all([
        fetchSitemapAiModels(),
        fetchUserModelsForSitemap(context),
      ])
      return xmlResponse(
        toUrlSetXml([
          ...aiModels.map((model) => ({
            loc: `${SITE_URL}/models/${encodeURIComponent(model.name)}`,
            changefreq: "daily" as const,
            priority: 0.6,
          })),
          ...userModels.map((model) => ({
            loc: `${SITE_URL}/models/u/${encodeURIComponent(model.id)}`,
            lastmod: model.updatedAt
              ? new Date(model.updatedAt * 1000).toISOString()
              : undefined,
            changefreq: "weekly" as const,
            priority: 0.6,
            images: model.thumbnailUrl
              ? [{ loc: model.thumbnailUrl, title: model.name }]
              : undefined,
          })),
        ]),
        ONE_DAY / 4,
      )
    })
  }

  const worksMatch = name.match(/^works-(\d{4}-\d{2}-\d{2})\.xml$/)
  if (worksMatch && isValidSitemapDate(worksMatch[1])) {
    const date = worksMatch[1]
    const today = toJstDateString(Math.floor(Date.now() / 1000))
    // 今日・昨日の分は投稿が増えるので短め、それより前はほとんど変わらないので長めにキャッシュ
    const isRecent =
      jstDayStartSeconds(date) >= jstDayStartSeconds(today) - ONE_DAY
    return withEdgeCache(request, waitUntil, async () => {
      const works = await fetchWorksOfDay(date)
      return xmlResponse(
        toUrlSetXml(
          works.map((work) => ({
            loc: `${SITE_URL}/posts/${work.id}`,
            lastmod: new Date(work.createdAt * 1000).toISOString(),
            images: work.largeThumbnailImageURL
              ? [{ loc: work.largeThumbnailImageURL, title: work.title }]
              : undefined,
          })),
        ),
        isRecent ? ONE_HOUR : ONE_DAY * 7,
      )
    })
  }

  throw new Response("Not Found", { status: 404 })
}
