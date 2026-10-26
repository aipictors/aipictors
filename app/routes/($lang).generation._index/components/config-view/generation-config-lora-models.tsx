import { ConfigLoraModel } from "~/routes/($lang).generation._index/components/config-view/config-lora-model"
import { LoraModelListDialogButton } from "~/routes/($lang).generation._index/components/config-view/lora-model-list-dialog-button"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useBoolean } from "usehooks-ts"
import { useUserModel } from "~/components/user-models/use-user-models"
import { parseUserLoraName } from "~/lib/user-models/generation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"

/**
 * みんなのモデルの LoRA（情報は API から取得）
 */
function UserLoraConfigItem(props: {
  id: string
  name: string
  value: number
  setValue(value: number): void
  onDelete(): void
}) {
  const { data } = useUserModel(props.id)
  return (
    <ConfigLoraModel
      imageURL={data?.thumbnailUrl ?? ""}
      name={data?.name ?? props.name}
      description={data ? "みんなのモデル" : ""}
      value={props.value}
      setValue={props.setValue}
      onDelete={props.onDelete}
    />
  )
}

export function GenerationConfigLoraModels () {
  const context = useGenerationContext()

  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const currentModels = context.promptLoraModels.map((model) => {
    const [name, value] = model.split(":")
    return { name, value: Number.parseFloat(value) }
  })

  const currentLoraModelNames = context.promptLoraModels.map((model) => {
    const [name] = model.split(":")
    return name
  })

  /**
   * 選択されたLoRAモデル
   */
  const selectedModels = context.imageLoraModels.filter((model) => {
    return currentLoraModelNames.includes(model.name)
  })

  /**
   * 選択されたみんなのモデルの LoRA
   */
  const selectedUserLoras = currentModels
    .map((model) => ({ ...model, id: parseUserLoraName(model.name) }))
    .filter(
      (model): model is { name: string; value: number; id: string } =>
        model.id !== null,
    )

  const selectedCount = selectedModels.length + selectedUserLoras.length

  /**
   * 使用可能なLoRA数
   */
  const availableImageGenerationMaxTasksCount = context.availableLoraModelsCount

  return (
    <>
      {0 < selectedCount && (
        <Accordion type="single" collapsible defaultValue="setting">
          <AccordionItem value="setting">
            <AccordionTrigger>
              <div className="flex text-left">
                <p>LoRA（エフェクト）詳細</p>
                <p>({selectedCount})</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {0 < selectedModels.length && (
                <div className="space-y-2">
                  {selectedModels.map((model) => (
                    <ConfigLoraModel
                      key={model.id}
                      imageURL={model.thumbnailImageURL ?? ""}
                      name={model.name}
                      description={model.description ?? ""}
                      value={
                        currentModels.find((m) => m.name === model.name)
                          ?.value ?? 0
                      }
                      setValue={(value) => {
                        context.updateLoraModel(model.name, value)
                      }}
                      onDelete={() => {
                        context.changeLoraModel(model.name)
                      }}
                    />
                  ))}
                </div>
              )}
              {selectedUserLoras.map((model) => (
                <UserLoraConfigItem
                  key={model.name}
                  id={model.id}
                  name={model.name}
                  value={Number.isNaN(model.value) ? 1 : model.value}
                  setValue={(value) => {
                    context.updateLoraModel(model.name, value)
                  }}
                  onDelete={() => {
                    context.changeLoraModel(model.name)
                  }}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <LoraModelListDialogButton
        isOpen={isOpen}
        models={context.imageLoraModels}
        selectedModelNames={currentLoraModelNames}
        availableImageGenerationMaxTasksCount={
          availableImageGenerationMaxTasksCount
        }
        onClose={onClose}
        onSelect={context.changeLoraModel}
      />
    </>
  )
}
