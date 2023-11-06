import { TermsArticle } from "app/[lang]/(main)/terms/_components/TermsArticle"
import { MainPage } from "app/_components/page/MainPage"
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
