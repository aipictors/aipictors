import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Button } from "~/components/ui/button"
import { RotateCcw } from "lucide-react"

type Props = {
  onReset(): void
}

/**
 * 履歴のリセットボタン
 */
export function GenerationConfigResetButton(props: Props) {
  return (
    <AppConfirmDialog
      title={"確認"}
      description={"本当にリセットしますか？"}
      onNext={props.onReset}
      onCancel={() => {}}
    >
      <div className="flex w-full flex-col gap-y-2">
        <Button variant={"secondary"}>
          <RotateCcw className="w-4" />
          リセット
        </Button>
      </div>
    </AppConfirmDialog>
  )
}
