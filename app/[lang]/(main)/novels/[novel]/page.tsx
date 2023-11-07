import { NovelArticle } from "app/[lang]/(main)/novels/[novel]/_components/NovelArticle"
import { MainPage } from "app/_components/page/MainPage"
import type { Metadata } from "next"

/**
 * 小説の詳細
 * @returns
 */
const NovelPage = async () => {
  return (
    <MainPage>
      <NovelArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NovelPage
