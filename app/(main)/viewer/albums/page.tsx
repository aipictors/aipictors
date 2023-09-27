import type { Metadata } from "next"
import { ViewerAlbumWorks } from "app/(main)/viewer/albums/components/ViewerAlbumWorks"
import { MainPage } from "app/components/MainPage"

const ViewerAlbumsPage = async () => {
  return (
    <MainPage>
      <ViewerAlbumWorks />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerAlbumsPage
