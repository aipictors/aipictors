import { MyAlbum } from "app/[lang]/(main)/my/albums/[album]/_components/viewer-album-article"
import { MainCenterPage } from "app/_components/page/main-center-page"
import type { Metadata } from "next"

const MyAlbumPage = async () => {
  return (
    <MainCenterPage>
      <MyAlbum />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyAlbumPage
