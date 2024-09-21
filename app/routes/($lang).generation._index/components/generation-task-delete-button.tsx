import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { cn } from "~/lib/utils"
import { Loader2Icon, XIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onDelete(): void
  isDeletedLoading: boolean
}

/**
 * 画像生成の削除ボタン
 */
export function GenerationTaskDeleteButton(props: Props) {
  const t = useTranslation()

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
            title={t("確認", "Confirm")}
            description={t(
              "本当に削除しますか？",
              "Are you sure you want to delete this?",
            )}
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
