import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { GenerationConfigMemoList } from "@/routes/($lang).generation._index/components/config-view/generation-config-memo-list"
import { GenerationConfigMemoOperationParts } from "@/routes/($lang).generation._index/components/config-view/generation-config-memo-operation-parts"

type Props = {
  isOpen: boolean
  onClose: () => void
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  memos: any[] | undefined
  refetch: () => void
}

/**
 * 履歴メモ設定ダイアログ
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
