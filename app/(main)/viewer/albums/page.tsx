import type { Metadata } from "next"
import { ViewerAlbumList } from "app/(main)/viewer/albums/components/ViewerAlbumList"
import { MainPage } from "app/components/MainPage"

const ViewerAlbumsPage = async () => {
  return (
    <MainPage>
      <ViewerAlbumList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerAlbumsPage
