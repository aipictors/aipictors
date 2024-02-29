"use client"

import { GenerationConfigMemoUpdateContent } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-update-contents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"
import { PencilIcon } from "lucide-react"
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
export const GenerationConfigMemoUpdateParts = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const closeDialog = () => {
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
        className="absolute right-2"
        variant={"ghost"}
        size={"icon"}
      >
        <PencilIcon className="w-4" />
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader />
          <div>{"保存したメモは復元できます"}</div>
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
