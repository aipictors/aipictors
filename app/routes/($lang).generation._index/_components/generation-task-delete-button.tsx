import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { cn } from "@/_lib/cn"
import { Loader2Icon, XIcon } from "lucide-react"

type Props = {
  onDelete(): void
  isDeletedLoading: boolean
}

/**
 * 画像生成の削除ボタン
 */
export const GenerationTaskDeleteButton = (props: Props) => {
  return (
    <button
      disabled={props.isDeletedLoading}
      type={"button"}
      onClick={() => {}}
      className={cn(
        "absolute top-2 right-2 rounded-full opacity-80 transition-all hover:opacity-40",
      )}
    >
      <div className="flex rounded-lg bg-white px-1 py-1">
        {props.isDeletedLoading ? (
          <Loader2Icon color="black" className={"animate-spin"} />
        ) : (
          <AppConfirmDialog
            title={"確認"}
            description={"本当に削除しますか？"}
            onNext={props.onDelete}
            onCancel={() => {}}
          >
            <XIcon color="black" className={"fill-white"} />
          </AppConfirmDialog>
        )}
      </div>
    </button>
  )
}
