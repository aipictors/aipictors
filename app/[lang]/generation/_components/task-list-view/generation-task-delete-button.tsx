import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"

type Props = {
  disabled: boolean
  onDelete(): void
}

/**
 * 履歴の削除ボタン
 * @param props
 * @returns
 */
export function GenerationTaskDeleteButton(props: Props) {
  return (
    <AppConfirmDialog
      title={"確認"}
      description={"本当に削除しますか？"}
      onNext={props.onDelete}
      onCancel={() => {}}
    >
      <Button disabled={props.disabled} variant={"ghost"} size={"icon"}>
        <Trash2Icon className="w-4" />
      </Button>
    </AppConfirmDialog>
  )
}
