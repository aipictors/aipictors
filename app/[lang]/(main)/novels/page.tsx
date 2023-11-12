import { NovelList } from "@/app/[lang]/(main)/novels/_components/novel-list"
import { MainPage } from "@/app/_components/page/main-page"
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
