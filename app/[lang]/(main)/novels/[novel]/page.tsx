import { NovelArticle } from "app/[lang]/(main)/novels/[novel]/_components/NovelArticle"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

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
