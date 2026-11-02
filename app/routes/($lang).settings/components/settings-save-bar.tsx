import { Loader2Icon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isSaving: boolean
  onSave: () => void
  label?: string
}

/**
 * 保存ボタン。長いページでも探さずに押せるよう、画面の下に固定する
 */
export function SettingsSaveBar(props: Props) {
  const t = useTranslation()

  return (
    <div className="sticky bottom-0 z-20 -mx-2 border-t bg-background/95 px-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:mx-0 md:px-0">
      <Button
        className="h-11 w-full md:ml-auto md:flex md:w-40"
        disabled={props.isSaving}
        onClick={props.onSave}
      >
        {props.isSaving ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          (props.label ?? t("保存する", "Save"))
        )}
      </Button>
    </div>
  )
}
