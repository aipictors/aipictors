import type { Metadata } from "next"
import { NovelList } from "app/[lang]/(main)/novels/components/NovelList"
import { MainPage } from "app/components/MainPage"

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
