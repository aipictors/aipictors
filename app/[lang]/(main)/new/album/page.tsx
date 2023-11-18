import { NewAlbumImage } from "@/app/[lang]/(main)/new/album/_components/new-album-image"
import { NewAlbumWorkList } from "@/app/[lang]/(main)/new/album/_components/new-album-work-list"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * 新しいシリーズ
 * @returns
 */
const NewAlbumPage = async () => {
  return (
    <MainPage>
      <div className="flex flex-col">
        <NewAlbumImage />
        <NewAlbumWorkList />
      </div>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NewAlbumPage
