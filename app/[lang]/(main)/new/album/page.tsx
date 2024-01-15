import { NewAlbumImage } from "@/app/[lang]/(main)/new/album/_components/new-album-image"
import { NewAlbumWorkList } from "@/app/[lang]/(main)/new/album/_components/new-album-work-list"
import { AppPage } from "@/components/app/app-page"
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

export const revalidate = 60

export default NewAlbumPage
