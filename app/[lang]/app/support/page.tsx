import { AppFooter } from "app/[lang]/app/_components/AppFooter"
import { AppSupportDescription } from "app/[lang]/app/support/_components/AppSupportDescription"
import type { Metadata } from "next"

const AppSupportPage = async () => {
  return (
    <>
      <AppSupportDescription />
      <AppFooter />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "サポート" },
  description: "Aipictorsのアプリをダウンロード",
}

export const revalidate = 3600

export default AppSupportPage
