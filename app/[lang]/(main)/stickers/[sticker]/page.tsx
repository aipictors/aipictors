import { StickerArticle } from "app/[lang]/(main)/stickers/[sticker]/_components/StickerArticle"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

const StickerPage = async () => {
  return (
    <MainPage>
      <StickerArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickerPage
