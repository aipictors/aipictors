import type { Metadata } from "next"
import { AlbumArticle } from "app/[lang]/(main)/albums/[album]/components/AlbumArticle"
import { MainPage } from "app/components/MainPage"

const AlbumPage = async () => {
  return (
    <MainPage>
      <AlbumArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AlbumPage
