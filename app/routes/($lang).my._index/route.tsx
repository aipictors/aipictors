import { AppLoadingPage } from "@/components/app/app-loading-page"
import { DashboardHomeContents } from "@/routes/($lang).my._index/components/my-home-contents"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Suspense } from "react"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - ダッシュボード - ホーム"

  const metaDescription = "ダッシュボード"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "robots", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export default function MyHome() {
  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        <DashboardHomeContents />
      </Suspense>
    </>
  )
}
