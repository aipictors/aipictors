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
import { useTranslation } from "~/hooks/use-translation"

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

  const t = useTranslation()

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
        className="mb-2 h-10 md:mb-0"
      >
        {t("現在の設定をメモする", "Save current settings")}
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader />
          <div>
            {t("保存したプリセットは復元できます", "Presets can be restored.")}
          </div>
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
              {t("閉じる", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
