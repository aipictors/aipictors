import { StickerArticle } from "@/app/[lang]/(beta)/stickers/[sticker]/_components/sticker-article"
import { AppPage } from "@/components/app/app-page"
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

export const revalidate = 60

export default StickerPage
