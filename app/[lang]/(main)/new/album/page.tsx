import { NewAlbumForm } from "app/[lang]/(main)/new/album/_components/NewAlbumForm"
import { MainPage } from "app/_components/page/MainPage"
import type { Metadata } from "next"

/**
 * 新しいシリーズ
 * @returns
 */
const NewAlbumPage = async () => {
  return (
    <MainPage>
      <NewAlbumForm />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NewAlbumPage
