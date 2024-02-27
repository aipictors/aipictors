"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
          <Input type="text" placeholder="タイトル" />
          <Input type="text" placeholder="説明（省略可）" />
          <Input type="text" placeholder="プロンプト" />
          <Input type="text" placeholder="ネガティブプロンプト" />
          <Input type="number" placeholder="Steps" />
          <Input type="number" placeholder="Scale" />
          <Input type="number" placeholder="Seeds" />
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
