import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { StickerArticle } from "@/routes/($lang)._main.stickers.$sticker/_components/sticker-article"
import { useParams } from "@remix-run/react"

/**
 * スタンプの詳細
 * @returns
 */
export default function Sticker() {
  const params = useParams()

  if (params.sticker === undefined) {
    throw new ParamsError()
  }

  return (
    <AppPage>
      <StickerArticle />
    </AppPage>
  )
}
