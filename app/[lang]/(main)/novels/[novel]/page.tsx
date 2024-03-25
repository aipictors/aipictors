import { NovelArticle } from "@/app/[lang]/(main)/novels/[novel]/_components/novel-article"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * 小説の詳細
 * @returns
 */
const NovelPage = async () => {
  return (
    <AppPage>
      <NovelArticle />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export default NovelPage
