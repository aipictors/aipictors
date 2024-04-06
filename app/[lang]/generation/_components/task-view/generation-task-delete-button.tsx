import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { Button } from "@/_components/ui/button"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

type Props = {
  disabled: boolean
  onDelete(): void
  title?: string
  isEnable?: boolean
}

/**
 * 履歴の削除ボタン
 * @param props
 * @returns
 */
export function GenerationTaskDeleteButton(props: Props) {
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
