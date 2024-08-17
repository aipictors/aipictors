import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { GenerationConfigMemoSavingContent } from "~/routes/($lang).generation._index/components/config-view/generation-config-memo-saving-contents"
import { useState } from "react"

type Props = {
  refetchMemos: () => void
}

/**
 * 履歴メモ設定ダイアログ
 */
export function GenerationConfigMemoOperationParts(props: Props) {
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
        className="mb-2 h-10 md:mb-0"
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
