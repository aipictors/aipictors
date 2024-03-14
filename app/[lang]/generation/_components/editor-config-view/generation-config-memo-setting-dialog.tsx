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
import type { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"

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
