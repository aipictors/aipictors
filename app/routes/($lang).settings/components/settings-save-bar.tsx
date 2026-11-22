import { CheckIcon, Loader2Icon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isSaving: boolean
  onSave: () => void
  label?: string
}

/**
 * 保存ボタン。長いページでも探さずに押せるよう、画面の下に浮かせて固定する
 */
export function SettingsSaveBar(props: Props) {
  const t = useTranslation()

  return (
    <div className="-mx-2 sticky bottom-0 z-20 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:mx-0 md:px-0 md:pb-4">
      <div className="flex items-center gap-3 rounded-2xl border bg-background/90 p-2 shadow-lg backdrop-blur-md md:pl-4">
        <p className="hidden min-w-0 flex-1 text-muted-foreground text-xs md:block">
          {t(
            "変更は「保存する」を押すと反映されます",
            "Changes apply when you press Save",
          )}
        </p>
        <Button
          className="h-11 w-full rounded-xl font-semibold md:w-44"
          disabled={props.isSaving}
          onClick={props.onSave}
        >
          {props.isSaving ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <>
              <CheckIcon className="mr-1.5 size-4" />
              {props.label ?? t("保存する", "Save")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
