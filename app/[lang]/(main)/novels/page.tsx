import { NovelList } from "app/[lang]/(main)/novels/_components/NovelList"
import { MainPage } from "app/_components/pages/MainPage"
import type { Metadata } from "next"

/**
 * 小説の一覧
 * @returns
 */
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
