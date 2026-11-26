import { Button } from "~/components/ui/button"
import { PlusIcon } from "lucide-react"
import { lazy, Suspense } from "react"

/**
 * スタンプを作る画面（画像の切り抜き・アニメーション画像の変換など 約 100KB）は、スタンプの一覧を開いたときに読む。
 * 以前は作品ページを開くだけで読み込んでいた
 */
const AddStickerDialog = lazy(() =>
  import(
    "~/routes/($lang)._main.posts.$post._index/components/add-sticker-dialog"
  ).then((module) => ({ default: module.AddStickerDialog })),
)

type Props = {
  onAddedSicker?: () => void
}

/**
 * スタンプ追加ボタン
 */
export function AddStickerButton(props: Props) {
  const button = (
    <div className="border-2 border-transparent p-1">
      <Button className="size-24" size={"icon"} variant={"secondary"}>
        <PlusIcon />
      </Button>
    </div>
  )

  return (
    <Suspense fallback={button}>
      <AddStickerDialog onAddedSicker={props.onAddedSicker}>
        {button}
      </AddStickerDialog>
    </Suspense>
  )
}
