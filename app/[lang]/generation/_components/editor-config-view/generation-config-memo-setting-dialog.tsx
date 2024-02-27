"use client"

import { GenerationConfigMemoList } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-list"
import { GenerationConfigMemoOperationParts } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-operation-parts"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"

type Props = {
  isOpen: boolean
  onClose: () => void
}

/**
 * 履歴メモ設定ダイアログ
 * @param props
 * @returns
 */
export const GenerationConfigMemoSettingDialog = (props: Props) => {
  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={() => {
        props.onClose()
      }}
    >
      <DialogContent>
        <DialogHeader />
        <GenerationConfigMemoList />
        <DialogFooter>
          <GenerationConfigMemoOperationParts />
          <Button
            onClick={() => {
              props.onClose()
            }}
          >
            {"閉じる"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
