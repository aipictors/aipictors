import { TriangleAlertIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import {
  type CheckpointLoraFamily,
  loraFamilyLabel,
} from "~/lib/user-models/lora-compat"

export type PendingModelSwitch = {
  /** 切り替え先のモデル名 */
  modelName: string
  family: CheckpointLoraFamily
  /** 切り替えると効かなくなる LoRA（表示名） */
  loraNames: string[]
  /** LoRA を外す */
  removeLoras(): void
  /** モデルを切り替える */
  apply(): void
}

type Props = {
  pending: PendingModelSwitch | null
  onClose(): void
}

/**
 * LoRA を選んでいるときに、その LoRA が効かないモデルへ切り替えようとしたときの確認
 * 生成の邪魔にならないよう「外して切り替える」をいちばん押しやすくし、つけたままも選べるようにする
 */
export function GenerationLoraSwitchDialog(props: Props) {
  const t = useTranslation()
  const pending = props.pending

  const isNoLora = pending?.family === "NONE"

  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) props.onClose()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader className="pr-6">
          <DialogTitle className="flex items-start gap-2 text-balance leading-snug">
            <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-amber-500" />
            {isNoLora
              ? t(
                  "このモデルでは LoRA を使えません",
                  "This model can't use LoRA",
                )
              : t(
                  "このモデルでは選択中の LoRA が効きません",
                  "Your LoRA won't work with this model",
                )}
          </DialogTitle>
          <DialogDescription>
            {pending &&
              (isNoLora
                ? t(
                    `「${pending.modelName}」は LoRA に対応していないモデルです。LoRA を外して切り替えますか？`,
                    `"${pending.modelName}" doesn't support LoRA. Remove the LoRA and switch?`,
                  )
                : t(
                    `「${pending.modelName}」は ${loraFamilyLabel(pending.family)} のモデルです。種類の違う LoRA は生成に反映されません。LoRA を外して切り替えますか？`,
                    `"${pending.modelName}" is a ${loraFamilyLabel(pending.family)} model. LoRAs made for another type are ignored. Remove them and switch?`,
                  ))}
          </DialogDescription>
        </DialogHeader>

        {pending && (
          <ul className="space-y-1 rounded-lg bg-muted p-3 text-sm">
            {pending.loraNames.map((name) => (
              <li key={name} className="truncate">
                ・{name}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <Button
            className="h-11 rounded-xl font-bold"
            onClick={() => {
              if (!pending) return
              pending.removeLoras()
              pending.apply()
              props.onClose()
            }}
          >
            {t("LoRA を外して切り替える", "Remove LoRA and switch")}
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={() => {
              if (!pending) return
              pending.apply()
              props.onClose()
            }}
          >
            {t("LoRA をつけたまま切り替える", "Switch and keep LoRA")}
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl text-muted-foreground"
            onClick={props.onClose}
          >
            {t("切り替えない", "Cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
