import { ViewerAlbumArticle } from "app/[lang]/(main)/viewer/albums/[album]/components/ViewerAlbumArticle"
import { MainCenterPage } from "app/components/MainCenterPage"
import type { Metadata } from "next"

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
