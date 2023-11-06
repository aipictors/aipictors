import { AlbumList } from "app/[lang]/(main)/albums/_components/AlbumList"
import { MainPage } from "app/_components/page/MainPage"
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
