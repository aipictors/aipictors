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
import { imageGenerationMemosQuery } from "@/graphql/queries/image-generation/image-generation-memos"
import { useQuery } from "@apollo/client"

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
  const { data: memos, refetch } = useQuery(imageGenerationMemosQuery, {
    variables: {
      limit: 320,
      offset: 0,
      orderBy: {
        createdAt: "DESC",
      },
    },
  })

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={() => {
        props.onClose()
      }}
    >
      <DialogContent>
        <DialogHeader />
        <GenerationConfigMemoList memos={memos} refetchMemos={refetch} />
        <DialogFooter>
          <Button
            variant={"secondary"}
            onClick={() => {
              props.onClose()
            }}
          >
            {"閉じる"}
          </Button>
          <GenerationConfigMemoOperationParts refetchMemos={refetch} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
