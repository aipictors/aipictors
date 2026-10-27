import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  listWorkSitemapDates,
  SITE_URL,
  toSitemapIndexXml,
  withEdgeCache,
  xmlResponse,
} from "~/lib/server/sitemap.server"

/**
 * サイトマップのインデックス
 * 固定ページ・タグ・モデルと、投稿日ごとの作品のサイトマップをまとめる
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  return withEdgeCache(request, context.cloudflare?.ctx?.waitUntil?.bind(context.cloudflare.ctx), async () => {
    const dates = listWorkSitemapDates(Math.floor(Date.now() / 1000))
    const sitemaps = [
      { loc: `${SITE_URL}/sitemaps/pages.xml` },
      { loc: `${SITE_URL}/sitemaps/tags.xml` },
      { loc: `${SITE_URL}/sitemaps/models.xml` },
      { loc: `${SITE_URL}/sitemaps/users.xml` },
      ...dates.map((date) => ({
        loc: `${SITE_URL}/sitemaps/works-${date}.xml`,
      })),
    ]
    return xmlResponse(toSitemapIndexXml(sitemaps), 60 * 60)
  })
}
