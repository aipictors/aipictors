import type { Metadata } from "next"
import { AppAboutHeader } from "app/app/components/AppAboutHeader"
import { AppFooter } from "app/app/components/AppFooter"

const AppPage = async () => {
  return (
    <>
      <AppAboutHeader />
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
