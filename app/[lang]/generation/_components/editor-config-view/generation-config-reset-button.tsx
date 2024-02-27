import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

type Props = {
  onReset(): void
}

/**
 * 履歴のリセットボタン
 * @param props
 * @returns
 */
export function GenerationConfigResetButton(props: Props) {
  return (
    <AppConfirmDialog
      title={"確認"}
      description={"本当にリセットしますか？"}
      onNext={props.onReset}
      onCancel={() => {}}
    >
      <div className="flex flex-col gap-y-2 w-full">
        <Button variant={"secondary"}>
          <RotateCcw className="w-4" />
          リセット
        </Button>
      </div>
    </AppConfirmDialog>
  )
}
