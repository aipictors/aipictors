"use client"

import { GenerationConfigMemoSavingContent } from "@/app/[lang]/generation/_components/config-view/generation-config-memo-saving-contents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

type Props = {
  refetchMemos: () => void
}

/**
 * 履歴メモ設定ダイアログ
 * @param props
 * @returns
 */
export const GenerationConfigMemoOperationParts = (props: Props) => {
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
        className="h-11"
      >
        {"現在の設定をメモする"}
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
            <GenerationConfigMemoSavingContent
              refetchMemos={props.refetchMemos}
              onClose={closeDialog}
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