import { ViewerAlbumHeader } from "app/[lang]/(main)/my/albums/_components/ViewerAlbumHeader"
import { MainPage } from "app/_components/pages/MainPage"
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
