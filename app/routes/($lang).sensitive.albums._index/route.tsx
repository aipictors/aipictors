import { AppPage } from "@/_components/app/app-page"
import { AlbumCard } from "@/routes/($lang)._main.albums._index/_components/album-card"

export default function SensitiveAlbumsPage() {
  return (
    <AppPage>
      <div className="flex flex-col">
        <AlbumCard />
      </div>
    </AppPage>
  )
}
