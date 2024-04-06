import { GuidelineArticle } from "@/[lang]/(main)/guideline/_components/guideline-article"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

/**
 * ガイドライン
 * @returns
 */
const GuidelinePage = async () => {
  return (
    <AppPage>
      <GuidelineArticle />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default GuidelinePage
