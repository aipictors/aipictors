import { GuidelineArticle } from "@/app/[lang]/(main)/guideline/_components/guideline-article"
import { AppPage } from "@/components/app/app-page"
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

export const revalidate = 60

export default GuidelinePage
