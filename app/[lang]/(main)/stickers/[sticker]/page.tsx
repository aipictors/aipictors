import { StickerArticle } from "@/[lang]/(main)/stickers/[sticker]/_components/sticker-article"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

/**
 * スタンプの詳細
 * @returns
 */
const StickerPage = async () => {
  return (
    <AppPage>
      <StickerArticle />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default StickerPage
