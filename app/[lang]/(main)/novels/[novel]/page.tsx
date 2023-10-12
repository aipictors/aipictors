import type { Metadata } from "next"
import { NovelArticle } from "app/[lang]/(main)/novels/[novel]/components/NovelArticle"
import { MainPage } from "app/components/MainPage"

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
