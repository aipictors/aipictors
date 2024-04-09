import { NewAlbumImage } from "@/[lang]/(main)/new/album/_components/new-album-image"
import { NewAlbumWorkList } from "@/[lang]/(main)/new/album/_components/new-album-work-list"
import { AppPage } from "@/_components/app/app-page"

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
