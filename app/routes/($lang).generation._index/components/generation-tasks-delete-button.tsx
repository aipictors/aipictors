import { Button } from "~/components/ui/button"
import { Loader2Icon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationTasksTrashConfirmDialog } from "~/routes/($lang).generation._index/components/generation-tasks-trash-confirm-dialog"

type Props = {
  title?: string
  disabled?: boolean
  isEnable?: boolean
  isDeletedLoading: boolean
  onDelete(): void
}

/**
 * 画像生成の一括削除ボタン
 */
export function GenerationTasksDeleteButton (props: Props) {
  const t = useTranslation()

  if (props.isDeletedLoading) {
    return (
      <Button onClick={() => {}} variant={"ghost"} size={"icon"}>
        <Loader2Icon className="w-4 animate-spin" />
      </Button>
    )
  }

  return props.isEnable ? (
    <Button
      onClick={() => {
        toast(
          t(
            "削除対象の履歴を選択してください。",
            "Please select the history to delete.",
          ),
        )
      }}
      title={props.title}
      disabled={props.disabled}
      variant={"ghost"}
      size={"icon"}
    >
      <Trash2Icon className="w-4" />
    </Button>
  ) : (
    <GenerationTasksTrashConfirmDialog
      onDelete={props.onDelete}
      title={props.title ?? ""}
      disabled={props.disabled ?? false}
    />
  )
}
