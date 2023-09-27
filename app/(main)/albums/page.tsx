import type { Metadata } from "next"
import { AlbumList } from "app/(main)/albums/components/AlbumList"
import { AlbumListItem } from "app/(main)/albums/components/AlbumListItem"
import { MainPage } from "app/components/MainPage"

const AlbumsPage = async () => {
  return (
    <MainPage>
      <AlbumList />
      <AlbumListItem />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AlbumsPage
