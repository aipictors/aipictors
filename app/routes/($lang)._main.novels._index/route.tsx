import { AppPage } from "@/components/app/app-page"
import { NovelCard } from "@/routes/($lang)._main.novels._index/components/novel-card"

/**
 * 小説の一覧
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
