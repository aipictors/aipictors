import { NovelCard } from "@/[lang]/(main)/novels/_components/novel-card"
import { AppPage } from "@/_components/app/app-page"

/**
 * 小説の一覧
 * @returns
 */
export default function Novels() {
  return (
    <AppPage>
      <div>
        <NovelCard />
      </div>
    </AppPage>
  )
}
