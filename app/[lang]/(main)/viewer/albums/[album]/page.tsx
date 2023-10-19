import { ViewerAlbumArticle } from "app/[lang]/(main)/viewer/albums/[album]/_components/ViewerAlbumArticle"
import { MainCenterPage } from "app/_components/MainCenterPage"
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
