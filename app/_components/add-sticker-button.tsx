import { AddStickerDialog } from "@/_components/add-sticker-dialog"
import { Button } from "@/_components/ui/button"
import { PlusIcon } from "lucide-react"

/**
 * スタンプ追加ボタン
 */
export const AddStickerButton = () => {
  return (
    <AddStickerDialog>
      <Button className="h-24 w-24 p-1" size={"icon"} variant={"secondary"}>
        <PlusIcon />
      </Button>
    </AddStickerDialog>
  )
}
