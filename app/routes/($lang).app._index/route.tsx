import { AppAboutHeader } from "@/[lang]/app/_components/app-about-header"
import { AppFooter } from "@/[lang]/app/_components/app-footer"
import type { MetaFunction } from "@remix-run/cloudflare"

export default function FlutterApp() {
  return (
    <>
      <AppAboutHeader />
      {/* <Suspense fallback={null}>
        <AppMilestoneList />
      </Suspense> */}
      <AppFooter />
    </>
  )
}

export const meta: MetaFunction = () => {
  return [
    { name: "robots", content: "noindex" },
    { title: "Aipictorsアプリ" },
    { description: "Aipictorsのアプリをダウンロード" },
  ]
}
