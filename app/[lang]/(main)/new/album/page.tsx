import { NewAlbumImage } from "@/[lang]/(main)/new/album/_components/new-album-image"
import { NewAlbumWorkList } from "@/[lang]/(main)/new/album/_components/new-album-work-list"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

/**
 * 新しいシリーズ
 * @returns
 */
const NewAlbumPage = async () => {
  return (
    <AppPage>
      <div className="flex flex-col">
        <NewAlbumImage />
        <NewAlbumWorkList />
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NewAlbumPage
