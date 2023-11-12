import { SensitiveNewAlbumForm } from "app/[lang]/sensitive/albums/new/_components/sensitive-new-album-form"
import { MainPage } from "app/_components/page/main-page"
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
