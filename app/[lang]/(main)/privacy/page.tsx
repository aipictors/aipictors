import { PrivacyArticle } from "@/app/[lang]/(main)/privacy/_components/privacy-article"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

const PrivacyPage = async () => {
  return (
    <MainPage>
      <PrivacyArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default PrivacyPage
