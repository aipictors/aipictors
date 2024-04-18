import { AppPage } from "@/_components/app/app-page"
import { AlbumCard } from "@/routes/($lang)._main.albums._index/_components/album-card"

/**
 * シリーズの一覧
 * @returns
 */
export default function albums() {
  return (
    <AppPage>
      <div className="flex flex-col">
        <AlbumCard />
      </div>
    </AppPage>
  )
}
