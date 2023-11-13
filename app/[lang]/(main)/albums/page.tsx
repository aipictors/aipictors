import { AlbumList } from "@/app/[lang]/(main)/albums/_components/album-list"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * シリーズの一覧
 * @returns
 */
const AlbumsPage = async () => {
  return (
    <MainPage>
      <AlbumList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AlbumsPage
