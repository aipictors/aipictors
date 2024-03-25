import { AppAboutHeader } from "@/app/[lang]/app/_components/app-about-header"
import { AppFooter } from "@/app/[lang]/app/_components/app-footer"
import type { Metadata } from "next"

const FlutterAppPage = async () => {
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

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "Aipictorsアプリ" },
  description: "Aipictorsのアプリをダウンロード",
}

export default FlutterAppPage
