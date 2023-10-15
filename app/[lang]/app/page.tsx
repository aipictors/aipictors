import { AppAboutHeader } from "app/[lang]/app/components/AppAboutHeader"
import { AppFooter } from "app/[lang]/app/components/AppFooter"
import { AppMilestoneList } from "app/[lang]/app/components/AppMilestoneList"
import type { Metadata } from "next"
import { Suspense } from "react"

const AppPage = async () => {
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

export const revalidate = 3600

export default AppPage
