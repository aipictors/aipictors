import { ViewerAlbumHeader } from "app/[lang]/(main)/my/albums/_components/viewer-album-header"
import { MainPage } from "app/_components/page/main-page"
import type { Metadata } from "next"

const MyAlbumsPage = async () => {
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

export default MyAlbumsPage
