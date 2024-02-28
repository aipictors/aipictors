"use client"

import { GenerationConfigMemoSavingContent } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-saving-contents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { useState } from "react"

/**
 * 履歴メモ設定ダイアログ
 * @param props
 * @returns
 */
export const GenerationConfigMemoOperationParts = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
        className="h-11"
        variant="secondary"
      >
        {"現在の設定をメモする"}
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          setIsOpen(false)
        }}
      >
        <DialogContent>
          <DialogHeader />
          <div>メモを設定する</div>
          <GenerationConfigMemoSavingContent />
          <DialogFooter>
            <Button
              onClick={() => {
                setIsOpen(false)
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
