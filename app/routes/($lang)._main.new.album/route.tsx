import { AppPage } from "@/_components/app/app-page"
import { NewAlbumImage } from "@/routes/($lang)._main.new.album/_components/new-album-image"
import { NewAlbumWorkList } from "@/routes/($lang)._main.new.album/_components/new-album-work-list"

export default function NewAlbum() {
  return (
    <AppPage>
      <div className="flex flex-col">
        <NewAlbumImage />
        <NewAlbumWorkList />
      </div>
    </AppPage>
  )
}
