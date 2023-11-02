import { NewAlbumForm } from "app/[lang]/(main)/albums/new/_components/NewAlbumForm"
import { SensitiveNewAlbumForm } from "app/[lang]/sensitive/albums/new/components/SensitiveNewAlbumForm"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

const SensitiveNewAlbumPage = async () => {
  return (
    <MainPage>
      <SensitiveNewAlbumForm />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveNewAlbumPage
