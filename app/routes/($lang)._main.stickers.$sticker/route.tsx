import { StickerArticle } from "@/[lang]/(main)/stickers/[sticker]/_components/sticker-article"
import { AppPage } from "@/_components/app/app-page"
import { useParams } from "@remix-run/react"

/**
 * スタンプの詳細
 * @returns
 */
export default function Sticker() {
  const params = useParams()

  if (params.sticker === undefined) {
    throw new Error()
  }

  return (
    <AppPage>
      <StickerArticle />
    </AppPage>
  )
}
