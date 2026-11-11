import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { GuideArticleView } from "~/components/guides/guide-article-view"
import { config, META } from "~/config"
import { findGuideArticle } from "~/lib/guides/guide-articles"
import { seoHubHeaders } from "~/lib/seo-hubs/seo-hub-route"
import { createMeta } from "~/utils/create-meta"

/**
 * 解説記事。本文はコードの中（app/lib/guides/guide-articles.ts）にあり、API は読まない
 */
export async function loader(props: LoaderFunctionArgs) {
  const article = findGuideArticle(props.params.slug ?? "")
  if (!article) throw new Response(null, { status: 404 })
  return { article }
}

export const headers = seoHubHeaders

export const meta: MetaFunction<typeof loader> = (props) => {
  const article = props.data?.article
  if (!article) {
    return [{ title: "404 - Aipictors" }, { name: "robots", content: "noindex" }]
  }
  // 記事は日本語だけ。/en は canonical を日本語の URL にし、検索には日本語の URL を載せる
  return [
    ...createMeta(
      {
        ...META.TAGS,
        isIndex: props.params.lang !== "en",
      },
      {
        title: article.title,
        enTitle: article.title,
        description: article.description,
        enDescription: article.description,
        url: config.defaultOgpImageUrl,
      },
      "ja",
    ),
    { property: "article:published_time", content: article.publishedAt },
    { property: "article:modified_time", content: article.updatedAt },
  ]
}

export default function GuidePage() {
  const { article } = useLoaderData<typeof loader>()
  return <GuideArticleView key={article.slug} article={article} />
}
