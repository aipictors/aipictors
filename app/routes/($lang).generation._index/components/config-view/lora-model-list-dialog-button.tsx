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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { LoraImageModelList } from "~/routes/($lang).generation._index/components/config-view/lora-image-model-list"
import { UserModelPickerPanel } from "~/routes/($lang).generation._index/components/config-view/user-model-picker-panel"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"
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

export function LoraModelListDialogButton (props: Props) {
  const { value, setTrue, setFalse } = useBoolean()

  const t = useTranslation()

  const userModelSelection = useUserModelSelection()

  return (
    <Dialog
      open={value}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        setFalse()
      }}
    >
      <DialogTrigger asChild className="w-full">
        <Button className="w-full" variant={"secondary"} onClick={setTrue}>
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
        <Tabs defaultValue="official" className="min-w-0">
          <TabsList className="mb-3 w-full sm:w-auto">
            <TabsTrigger value="official" className="flex-1 px-4 sm:flex-none">
              {t("公式 LoRA", "Official")}
            </TabsTrigger>
            <TabsTrigger value="community" className="flex-1 px-4 sm:flex-none">
              {t("みんなのモデル", "Community")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="official">
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
          </TabsContent>
          <TabsContent value="community">
            <UserModelPickerPanel
              kind="LORA"
              selectedIds={userModelSelection.selectedLoraIds}
              onSelect={userModelSelection.toggleLora}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button className="w-full" onClick={setFalse}>
            {t("完了", "Done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
