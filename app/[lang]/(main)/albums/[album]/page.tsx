import { AlbumArticle } from "app/[lang]/(main)/albums/[album]/_components/AlbumArticle"
import { MainPage } from "app/_components/page/MainPage"
import type { Metadata } from "next"

/**
 * シリーズの詳細
 * @returns
 */
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
