import type { Metadata } from "next"
import { NovelList } from "app/(main)/novels/components/NovelList"
import { NovelListItem } from "app/(main)/novels/components/NovelListItem"
import { MainPage } from "app/components/MainPage"

const NovelsPage = async () => {
  return (
    <MainPage>
      <NovelList />
      <NovelListItem />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NovelsPage
