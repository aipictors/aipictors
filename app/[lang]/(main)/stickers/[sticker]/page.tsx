import { StickerArticle } from "app/[lang]/(main)/stickers/[sticker]/_components/sticker-article"
import { MainPage } from "app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * スタンプの詳細
 * @returns
 */
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
