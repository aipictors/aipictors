import { GuidelineArticle } from "app/[lang]/(main)/guideline/_components/GuidelineArticle"
import { MainPage } from "app/_components/page/MainPage"
import type { Metadata } from "next"

/**
 * ガイドライン
 * @returns
 */
const GuidelinePage = async () => {
  return (
    <MainPage>
      <GuidelineArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GuidelinePage
