import { NovelList } from "app/[lang]/(main)/novels/components/NovelList"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

const NovelsPage = async () => {
  return (
    <MainPage>
      <NovelList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NovelsPage
