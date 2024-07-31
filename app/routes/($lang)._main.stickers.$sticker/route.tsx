import { ParamsError } from "~/errors/params-error"
import { StickerArticle } from "~/routes/($lang)._main.stickers.$sticker/components/sticker-article"
import { useParams } from "@remix-run/react"

/**
 * スタンプの詳細
 */
export default function Sticker() {
  const params = useParams()

  if (params.sticker === undefined) {
    throw new ParamsError()
  }

  return (
    <>
      <StickerArticle />
    </>
  )
}
