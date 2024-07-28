import { AppPage } from "~/components/app/app-page"
import { AlbumCard } from "~/routes/($lang)._main.albums._index/components/album-card"

export default function SensitiveAlbumsPage() {
  return (
    <AppPage>
      <div className="flex flex-col">
        <AlbumCard />
      </div>
    </AppPage>
  )
}
