"use client"

import { GenerationConfigMemoUpdateContent } from "@/app/[lang]/generation/_components/config-view/generation-config-memo-update-contents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"
import { useState } from "react"

type Props = {
  memo: ImageGenerationMemoNode
  refetchMemos: () => void
}

/**
 * 履歴メモ設定ダイアログ
 * @param props
 * @returns
 */
export const GenerationMemoItemContents = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const closeDialog = () => {
    setIsOpen(false)
  }

  /**
   * タイムスタンプ
   * @param createdAt
   * @returns
   */
  const formatTimestamp = (createdAt: number) => {
    const date = new Date(createdAt * 1000)

    const year = date.getFullYear()

    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    const day = date.getDate().toString().padStart(2, "0")

    const hours = date.getHours().toString().padStart(2, "0")

    const minutes = date.getMinutes().toString().padStart(2, "0")

    return `${year}/${month}/${day} ${hours}:${minutes}`
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
        className="h-16 w-full"
        variant="ghost"
      >
        <div className="absolute left-2 text-left">
          <div className="left-2">{props.memo.title}</div>
          <div className="top-12 left-2">{props.memo.explanation}</div>
          {props.memo.createdAt && (
            <div className="top-12 left-2 opacity-40">
              {formatTimestamp(props.memo.createdAt)}
            </div>
          )}
        </div>
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader />
          <div>{"保存したプリセットは復元できます"}</div>
          <ScrollArea className="h-full">
            <GenerationConfigMemoUpdateContent
              refetchMemos={props.refetchMemos}
              onClose={closeDialog}
              memo={props.memo}
            />
          </ScrollArea>
          <DialogFooter>
            <Button
              variant={"secondary"}
              onClick={() => {
                closeDialog()
              }}
            >
              {"閉じる"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
