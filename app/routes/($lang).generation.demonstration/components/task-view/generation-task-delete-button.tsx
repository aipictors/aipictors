import { Button } from "~/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationTaskDeleteConfirmDialog } from "~/routes/($lang).generation.demonstration/components/task-view/generation-task-delete-confirm-dialog"

type Props = {
  disabled: boolean
  onDelete(): void
  title?: string
  isEnable?: boolean
}

/**
 * 履歴の削除ボタン
 */
export function GenerationTaskDeleteButton(props: Props) {
  const t = useTranslation()

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
    <GenerationTaskDeleteConfirmDialog
      onDelete={props.onDelete}
      title={props.title ?? ""}
      disabled={props.disabled}
    />
  )
}
