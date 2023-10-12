import type { Metadata } from "next"
import { AlbumList } from "app/[lang]/(main)/albums/components/AlbumList"
import { MainPage } from "app/components/MainPage"

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
