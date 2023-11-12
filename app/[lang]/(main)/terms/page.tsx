import { TermsArticle } from "app/[lang]/(main)/terms/_components/terms-article"
import { MainPage } from "app/_components/page/main-page"
import type { Metadata } from "next"

const TermsPage = async () => {
  return (
    <MainPage>
      <TermsArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TermsPage
