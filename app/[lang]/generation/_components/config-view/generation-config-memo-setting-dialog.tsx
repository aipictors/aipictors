"use client"

import { GenerationConfigMemoList } from "@/[lang]/generation/_components/config-view/generation-config-memo-list"
import { GenerationConfigMemoOperationParts } from "@/[lang]/generation/_components/config-view/generation-config-memo-operation-parts"
import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/_components/ui/dialog"
import type { ImageGenerationMemoNode } from "@/_graphql/__generated__/graphql"

type Props = {
  isOpen: boolean
  onClose: () => void
  memos: ImageGenerationMemoNode[] | undefined
  refetch: () => void
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
        <GenerationConfigMemoList
          memos={props.memos}
          refetchMemos={props.refetch}
        />
        <DialogFooter>
          <Button
            variant={"secondary"}
            onClick={() => {
              props.onClose()
            }}
          >
            {"閉じる"}
          </Button>
          <GenerationConfigMemoOperationParts refetchMemos={props.refetch} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
