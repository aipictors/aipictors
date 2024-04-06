import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { Button } from "@/_components/ui/button"
import { deleteImageGenerationTaskMutation } from "@/_graphql/mutations/delete-image-generation-task"
import { cn } from "@/_lib/utils"
import { useMutation } from "@apollo/client"
import { Loader2, Loader2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

type Props = {
  taskNanoid: string
  onDeleteTask(): void
  isDeletedLoading: boolean
}

/**
 * 画像生成の削除ボタン
 * @returns
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
            onNext={props.onDeleteTask}
            onCancel={() => {}}
          >
            <XIcon color="black" className={"fill-white"} />
          </AppConfirmDialog>
        )}
      </div>
    </button>
  )
}
