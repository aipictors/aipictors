import { ViewerAlbumHeader } from "app/[lang]/(main)/viewer/albums/components/ViewerAlbumHeader"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

const ViewerAlbumsPage = async () => {
  return (
    <MainPage>
      <ViewerAlbumHeader />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerAlbumsPage
