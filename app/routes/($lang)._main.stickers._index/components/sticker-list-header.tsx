import { AddStickerModal } from "@/routes/($lang)._main.stickers._index/components/add-sticker-modal"
import { useBoolean } from "usehooks-ts"

export const StickerListHeader = () => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <section className="flex flex-col gap-y-2">
        <h1 className="font-bold text-2xl">{"AIイラストスタンプ広場"}</h1>
        <p className="text-sm">
          {
            "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！"
          }
        </p>
      </section>
      <AddStickerModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
