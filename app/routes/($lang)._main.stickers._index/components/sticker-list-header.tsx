import { AddStickerModal } from "~/routes/($lang)._main.stickers._index/components/add-sticker-modal"
import { useBoolean } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  title?: string
}

export function StickerListHeader(props: Props) {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const t = useTranslation()

  return (
    <>
      <section className="flex flex-col gap-y-2">
        <h1 className="font-bold text-2xl">
          {t("AIイラストスタンプ広場", "AI Illustration Stamp Square")}
        </h1>
        {props.title && (
          <h2 className="text-bold">
            {t(
              `「${props.title}」のAIイラストのスタンプ一覧`,
              `AI illustration sticker list for "${props.title}"`,
            )}
          </h2>
        )}
        <p className="text-sm">
          {t(
            "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！",
            "Let's share the stickers you've made, and try downloading and using the stickers made by everyone!",
          )}
        </p>
      </section>
      <AddStickerModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
