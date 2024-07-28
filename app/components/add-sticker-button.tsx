import { AddStickerDialog } from "@/components/add-sticker-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

type Props = {
  onAddedSicker?: () => void
}

/**
 * スタンプ追加ボタン
 */
export const AddStickerButton = (props: Props) => {
  return (
    <AddStickerDialog onAddedSicker={props.onAddedSicker}>
      <div className="border-2 border-transparent p-1">
        <Button className="h-24 w-24" size={"icon"} variant={"secondary"}>
          <PlusIcon />
        </Button>
      </div>
    </AddStickerDialog>
  )
}
