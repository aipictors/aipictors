import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Button } from "~/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

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
    <AppConfirmDialog
      title={t("確認", "Confirm")}
      description={t(
        "本当に削除しますか？",
        "Are you sure you want to delete this?",
      )}
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
