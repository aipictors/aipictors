import { AddStickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-dialog"
import { useTranslation } from "~/hooks/use-translation"
import { Button } from "~/components/ui/button"
import { ImageUpIcon, Loader2Icon, WandSparklesIcon } from "lucide-react"
import { lazy, Suspense, useState } from "react"

// 作成ツールはとても大きく、フォントもたくさん読むので、開いたときに読み込む
const StickerCreator = lazy(() =>
  import("~/routes/($lang)._main.stickers._index/components/sticker-creator").then(
    (module) => ({ default: module.StickerCreator }),
  ),
)

type Props = {
  title?: string
}

export function StickerListHeader (props: Props) {
  const t = useTranslation()

  const [isCreatorOpen, setIsCreatorOpen] = useState(false)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="font-bold text-xl md:text-2xl">
            {props.title
              ? t(
                  `「${props.title}」のAIイラストスタンプ`,
                  `AI illustration stickers for "${props.title}"`,
                )
              : t("AIイラストスタンプ広場", "AI Illustration Sticker Square")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "みんなが作ったスタンプをコメントで使えます。自分で作って公開することもできます。",
              "Use stickers made by everyone in your comments, or make and share your own.",
            )}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 md:flex">
          <Button
            className="h-10 gap-1.5 rounded-full"
            onClick={() => setIsCreatorOpen((value) => !value)}
            aria-expanded={isCreatorOpen}
          >
            <WandSparklesIcon className="size-4" />
            {t("ツールで作る", "Make with tool")}
          </Button>
          <AddStickerDialog>
            <Button variant={"secondary"} className="h-10 gap-1.5 rounded-full">
              <ImageUpIcon className="size-4" />
              {t("画像から作る", "From an image")}
            </Button>
          </AddStickerDialog>
        </div>
      </div>
      {isCreatorOpen && (
        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center rounded-xl border">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <StickerCreator onClose={() => setIsCreatorOpen(false)} />
        </Suspense>
      )}
    </section>
  )
}
