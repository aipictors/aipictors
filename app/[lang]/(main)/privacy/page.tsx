import { PrivacyArticle } from "app/[lang]/(main)/privacy/_components/PrivacyArticle"
import { MainPage } from "app/_components/pages/MainPage"
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
