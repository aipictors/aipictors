"use client"

import { AddStickerModal } from "@/app/[lang]/(main)/stickers/_components/add-sticker-modal"
import { Button } from "@/components/ui/button"
import { useDisclosure } from "@chakra-ui/react"
import { Plus } from "lucide-react"

export const StickerListHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <div className="flex flex-col w-full p-4 space-y-8">
        <div className="flex flex-col">
          <p className="font-bold text-2xl">AIイラストスタンプ広場</p>
          <p className="text-sm">
            作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-lg">自分で作ったスタンプを公開する</p>
          <Button
            aria-label="previous month"
            variant={"ghost"}
            size={"icon"}
            onClick={onOpen}
          >
            <Plus />
          </Button>
          <Button aria-label="previous month" variant={"ghost"}>
            <Plus fontSize={"mr-2"} />
            {"スタンプを作る"}
          </Button>
        </div>
      </div>
      <AddStickerModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
