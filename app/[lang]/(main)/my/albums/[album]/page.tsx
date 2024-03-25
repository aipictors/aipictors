import { MyAlbum } from "@/app/[lang]/(main)/my/albums/[album]/_components/viewer-album-article"
import { AppPageCenter } from "@/components/app/app-page-center"
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
