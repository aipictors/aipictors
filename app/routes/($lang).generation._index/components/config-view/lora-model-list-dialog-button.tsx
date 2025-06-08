import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { LoraImageModelList } from "~/routes/($lang).generation._index/components/config-view/lora-image-model-list"
import type { ImageLoraModelContextFragment } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import type { FragmentOf } from "gql.tada"
import { useBoolean } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isOpen: boolean
  models: FragmentOf<typeof ImageLoraModelContextFragment>[]
  selectedModelNames: string[]
  availableImageGenerationMaxTasksCount: number
  onSelect(name: string, triggerWord?: string): void
  onClose(): void
}

export function LoraModelListDialogButton(props: Props) {
  const { value, setTrue, setFalse } = useBoolean()

  const t = useTranslation()

  return (
    <Dialog
      open={value}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        setFalse()
      }}
    >
      <DialogTrigger asChild className="w-full">
        <Button
          size={"sm"}
          className="w-full"
          variant={"secondary"}
          onClick={setTrue}
        >
          {t("LoRA（エフェクト）を追加", "Add LoRA (Effect)")}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-(--breakpoint-md) lg:max-w-(--breakpoint-lg) xl:max-w-(--breakpoint-xl)">
        <DialogHeader>
          <DialogTitle className="hidden md:block xl:block">
            {t("LoRAを選択", "Select LoRA")}
          </DialogTitle>
          <DialogDescription>
            <p className="hidden md:block xl:block">
              {t(
                "使用するLoRA(エフェクト)を選択してください",
                "Select LoRA (Effect) to use",
              )}
            </p>
            <p>
              {t(
                `使用できるLoRA数 :${props.selectedModelNames.length}/${props.availableImageGenerationMaxTasksCount}`,
                `Number of usable LoRAs :${props.selectedModelNames.length}/${props.availableImageGenerationMaxTasksCount}`,
              )}
            </p>
          </DialogDescription>
        </DialogHeader>
        <LoraImageModelList
          models={props.models.map((model) => ({
            ...model,
            genre: model.genre || t("その他", "Other"),
            // TODO: 型解決
            triggerWord:
              typeof model.triggerWord === "string"
                ? model.triggerWord
                : undefined,
          }))}
          selectedModelNames={props.selectedModelNames}
          onSelect={props.onSelect}
        />
        <DialogFooter>
          <Button className="w-full" onClick={setFalse}>
            {t("完了", "Done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
