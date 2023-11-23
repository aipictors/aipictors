"use client"

import { AddStickerModal } from "@/app/[lang]/(beta)/stickers/_components/add-sticker-modal"
import { Button } from "@/components/ui/button"
import { Config } from "@/config"
import { Plus } from "lucide-react"
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
      {Config.isDevelopmentMode && (
        <section className="flex items-center space-x-4">
          <Button aria-label="previous month" onClick={onOpen}>
            <span>自分で作ったスタンプを公開する</span>
            <Plus className="ml-2 w-4" />
          </Button>
          {/* <Button aria-label="previous month" variant={"ghost"}>
            <Plus fontSize={"mr-2"} />
            {"スタンプを作る"}
          </Button> */}
        </section>
      )}
      <AddStickerModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
