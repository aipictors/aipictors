import { AppAboutHeader } from "app/[lang]/app/_components/AppAboutHeader"
import { AppFooter } from "app/[lang]/app/_components/AppFooter"
import type { Metadata } from "next"

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
