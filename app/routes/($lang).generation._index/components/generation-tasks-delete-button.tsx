import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Button } from "~/components/ui/button"
import { Loader2Icon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

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
export function GenerationTasksDeleteButton(props: Props) {
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
        toast("削除対象の履歴を選択してください。")
      }}
      title={props.title}
      disabled={props.disabled}
      variant={"ghost"}
      size={"icon"}
    >
      <Trash2Icon className="w-4" />
    </Button>
  ) : (
    <AppConfirmDialog
      title={"確認"}
      description={"本当に削除しますか？"}
      onNext={props.onDelete}
      onCancel={() => {}}
    >
      <Button
        title={props.title}
        disabled={props.disabled}
        variant={"ghost"}
        size={"icon"}
      >
        <Trash2Icon className="w-4" />
      </Button>
    </AppConfirmDialog>
  )
}
