import { NovelCard } from "@/app/[lang]/(main)/novels/_components/novel-card"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * 小説の一覧
 * @returns
 */
const NovelsPage = async () => {
  return (
    <MainPage>
      <div>
        <NovelCard />
      </div>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NovelsPage
