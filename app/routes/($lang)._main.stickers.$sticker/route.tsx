import { StickerArticle } from "@/[lang]/(main)/stickers/[sticker]/_components/sticker-article"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

/**
 * スタンプの詳細
 * @returns
 */
export default function Sticker() {
  return (
    <AppPage>
      <StickerArticle />
    </AppPage>
  )
}
