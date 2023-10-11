import type { Metadata } from "next"
import { ViewerAlbumArticle } from "app/(main)/viewer/albums/[album]/components/ViewerAlbumArticle"
import { MainCenterPage } from "app/components/MainCenterPage"

const AlbumPage = async () => {
  return (
    <MainCenterPage>
      <ViewerAlbumArticle />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AlbumPage
