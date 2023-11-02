import { SensitiveAlbumArticle } from "app/[lang]/sensitive/albums/[album]/components/SensitiveAlbumArticle"
import { MainPage } from "app/_components/MainPage"
import { PlaceholderPage } from "app/_components/Placeholder"
import type { Metadata } from "next"

const SensitiveAlbumPage = async () => {
  return (
    <MainPage>
      <SensitiveAlbumArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAlbumPage
