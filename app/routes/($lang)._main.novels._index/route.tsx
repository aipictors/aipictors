import { AppPage } from "@/_components/app/app-page"
import { NovelCard } from "@/routes/($lang)._main.novels._index/_components/novel-card"

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
