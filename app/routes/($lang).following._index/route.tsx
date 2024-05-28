import { FollowingList } from "@/routes/($lang).following._index/_components/following-list"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control":
      "max-age=0, s-maxage=60, stale-while-revalidate=2592000, stale-if-error=2592000",
  }
}

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - フォロー一覧"

  const metaDescription = "フォロー中のユーザ一覧です。"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: "noindex" },
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

export default function FollowingLayout() {
  return (
    <>
      <FollowingList />
    </>
  )
}
