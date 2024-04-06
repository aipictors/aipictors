import { MyAlbum } from "@/[lang]/(main)/my/albums/[album]/_components/viewer-album-article"
import { AppPageCenter } from "@/_components/app/app-page-center"
import type { Metadata } from "next"

const MyAlbumPage = async () => {
  return (
    <AppPageCenter>
      <MyAlbum />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export default MyAlbumPage
