import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { Button } from "@/_components/ui/button"
import { XIcon } from "lucide-react"

type Props = {
  imageUrl?: string
  title: string
  key: string
  onClick: () => void
  onDelete?: () => void
}

/**
 * スタンプボタン
 */
export const StickerButton = (props: Props) => {
  if (!props.imageUrl) {
    return null
  }

  return (
    <div className="relative">
      <button
        className="relative box-border rounded border-2 border-transparent p-1 transition duration-500 hover:border-2 hover:border-clear-bright-blue"
        key={props.key}
        type={"button"}
        onClick={props.onClick}
      >
        <img
          className="m-auto h-24 w-24"
          src={props.imageUrl}
          alt={props.title}
        />
      </button>
      {props.onDelete && (
        <AppConfirmDialog
          description="スタンプを削除しますか？"
          onNext={props.onDelete}
          onCancel={() => {}}
        >
          <Button
            variant={"secondary"}
            size={"icon"}
            className="absolute top-1 right-1 rounded-full"
            onClick={() => {}}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </AppConfirmDialog>
      )}
    </div>
  )
}
