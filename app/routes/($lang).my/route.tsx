import { AppCommonLayout } from "@/_components/app/app-common-layout"
import { MyContents } from "@/routes/($lang).my/_components/my-contents"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - ダッシュボード"

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

export default function MyLayout() {
  return (
    <>
      <AppCommonLayout outlet={<MyContents outlet={<Outlet />} />} />
    </>
  )
}
