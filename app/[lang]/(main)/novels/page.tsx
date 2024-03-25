import { NovelCard } from "@/app/[lang]/(main)/novels/_components/novel-card"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * 小説の一覧
 * @returns
 */
const NovelsPage = async () => {
  return (
    <AppPage>
      <div>
        <NovelCard />
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NovelsPage
