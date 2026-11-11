import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  fetchSitemapAiModels,
  fetchSitemapSensitiveTagNames,
  fetchSitemapTagNames,
  fetchSitemapUsers,
  fetchUserModelsForSitemap,
  fetchWorksOfDay,
  isValidSitemapDate,
  jstDayStartSeconds,
  SITE_URL,
  toJstDateString,
  toUrlSetXml,
  getSitemapKv,
  withEdgeCache,
  xmlResponse,
} from "~/lib/server/sitemap.server"
import { GUIDE_SUMMARIES } from "~/lib/guides/guide-summaries"
import {
  HUB_MIN_INDEX_WORKS,
  listHubModels,
  listHubTags,
  toHubModelPath,
  toHubTagPath,
} from "~/lib/seo-hubs/seo-hub-catalog.server"

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
  { path: "/popular", changefreq: "daily", priority: 0.7 },
  { path: "/ai-rankings", changefreq: "daily", priority: 0.6 },
  { path: "/tags", changefreq: "daily", priority: 0.8 },
  { path: "/search", changefreq: "daily", priority: 0.6 },
  { path: "/themes", changefreq: "daily", priority: 0.7 },
  { path: "/models", changefreq: "daily", priority: 0.8 },
  { path: "/events", changefreq: "weekly", priority: 0.6 },
  { path: "/posts/2d", changefreq: "daily", priority: 0.7 },
  { path: "/posts/2.5d", changefreq: "daily", priority: 0.7 },
  { path: "/posts/3d", changefreq: "daily", priority: 0.7 },
  { path: "/novels", changefreq: "daily", priority: 0.6 },
  { path: "/notes", changefreq: "weekly", priority: 0.5 },
  { path: "/albums", changefreq: "daily", priority: 0.5 },
  { path: "/stickers", changefreq: "weekly", priority: 0.5 },
  { path: "/generation", changefreq: "weekly", priority: 0.7 },
  { path: "/generation/about", changefreq: "monthly", priority: 0.5 },
  { path: "/plus", changefreq: "monthly", priority: 0.4 },
  { path: "/releases", changefreq: "weekly", priority: 0.5 },
  { path: "/about", changefreq: "monthly", priority: 0.5 },
  { path: "/r", changefreq: "hourly", priority: 0.7 },
  { path: "/r/rankings", changefreq: "daily", priority: 0.6 },
  { path: "/r/popular", changefreq: "daily", priority: 0.5 },
  { path: "/r/themes", changefreq: "daily", priority: 0.5 },
  { path: "/r/albums", changefreq: "weekly", priority: 0.5 },
  { path: "/r/posts/2d", changefreq: "daily", priority: 0.5 },
  { path: "/r/posts/3d", changefreq: "daily", priority: 0.5 },
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
 * - /sitemaps/sensitive-tags.xml R18 の人気のタグ（検索に載せられるものだけ）
 * - /sitemaps/models.xml 公式モデル・みんなのモデル
 * - /sitemaps/prompts.xml 呪文まとめ（キャラ・タグ・モデル、全年齢と R18）と解説記事
 * - /sitemaps/users.xml 作品のあるユーザーのページ（最近投稿した人・ランキング上位）
 * - /sitemaps/works-YYYY-MM-DD.xml その日（JST）に投稿された作品と、投稿した人のユーザーページ
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

  if (name === "prompts.xml") {
    // 同梱の索引から作るので API は読まない。作品の少ないまとめは noindex なので載せない
    const hubUrls = (isSensitive: boolean) => [
      ...listHubTags(isSensitive)
        .filter((tag) => tag.count >= HUB_MIN_INDEX_WORKS)
        .map((tag) => ({
          loc: `${SITE_URL}${toHubTagPath(tag.name, isSensitive)}`,
          changefreq: "weekly" as const,
          priority: isSensitive ? 0.4 : tag.kind === "tag" ? 0.6 : 0.7,
        })),
      ...listHubModels(isSensitive)
        .filter((model) => model.count >= HUB_MIN_INDEX_WORKS)
        .map((model) => ({
          loc: `${SITE_URL}${toHubModelPath(model.name, isSensitive)}`,
          changefreq: "weekly" as const,
          priority: isSensitive ? 0.4 : 0.6,
        })),
    ]
    return xmlResponse(
      toUrlSetXml([
        { loc: `${SITE_URL}/prompts`, changefreq: "weekly", priority: 0.8 },
        { loc: `${SITE_URL}/guides`, changefreq: "monthly", priority: 0.6 },
        ...GUIDE_SUMMARIES.map((guide) => ({
          loc: `${SITE_URL}/guides/${guide.slug}`,
          changefreq: "monthly" as const,
          priority: 0.6,
        })),
        ...hubUrls(false),
        { loc: `${SITE_URL}/r/prompts`, changefreq: "weekly", priority: 0.5 },
        ...hubUrls(true),
      ]),
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

  if (name === "sensitive-tags.xml") {
    return withEdgeCache(request, waitUntil, async () => {
      const tagNames = await fetchSitemapSensitiveTagNames()
      return xmlResponse(
        toUrlSetXml(
          tagNames.map((tagName) => ({
            loc: `${SITE_URL}/r/tags/${encodeURIComponent(tagName)}`,
            changefreq: "daily",
            priority: 0.5,
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

  if (name === "users.xml") {
    return withEdgeCache(request, waitUntil, async () => {
      const users = await fetchSitemapUsers()
      return xmlResponse(
        toUrlSetXml(
          users.map((user) => ({
            loc: `${SITE_URL}/users/${encodeURIComponent(user.login)}`,
            changefreq: "weekly" as const,
            priority: Math.min(0.4 + Math.log10(user.worksCount + 1) / 10, 0.7),
          })),
        ),
        ONE_DAY / 2,
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
    return withEdgeCache(
      request,
      waitUntil,
      async () => {
        const works = await fetchWorksOfDay(date)
        // その日に投稿した人のユーザーページも載せる（全期間の日付をたどれば、作品のある人は全員入る）
        const userLogins = [
          ...new Set(
            works
              .map((work) => work.user?.login)
              .filter((login): login is string => Boolean(login)),
          ),
        ]
        return xmlResponse(
          toUrlSetXml([
            ...works.map((work) => ({
              loc: `${SITE_URL}/posts/${work.id}`,
              lastmod: new Date(work.createdAt * 1000).toISOString(),
              images: work.largeThumbnailImageURL
                ? [
                    {
                      loc: work.largeThumbnailImageURL,
                      title: work.title,
                      enTitle: work.enTitle ?? undefined,
                    },
                  ]
                : undefined,
            })),
            ...userLogins.map((login) => ({
              loc: `${SITE_URL}/users/${encodeURIComponent(login)}`,
              changefreq: "weekly" as const,
              priority: 0.5,
            })),
          ]),
          isRecent ? ONE_HOUR : ONE_DAY * 7,
        )
      },
      isRecent
        ? undefined
        : {
            kv: getSitemapKv(context),
            // 30 日より前の日はまず変わらないので KV に 30 日置く（全期間の日付を検索エンジンがたどり、7 日では作り直しが多かった）
            ttlSeconds:
              jstDayStartSeconds(date) <
              jstDayStartSeconds(today) - ONE_DAY * 30
                ? ONE_DAY * 30
                : ONE_DAY * 7,
          },
    )
  }

  throw new Response("Not Found", { status: 404 })
}
