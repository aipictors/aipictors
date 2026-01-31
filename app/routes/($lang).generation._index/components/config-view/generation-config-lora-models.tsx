import { ConfigLoraModel } from "~/routes/($lang).generation._index/components/config-view/config-lora-model"
import { LoraModelListDialogButton } from "~/routes/($lang).generation._index/components/config-view/lora-model-list-dialog-button"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useBoolean } from "usehooks-ts"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"

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
   * 使用可能なLoRA数
   */
  const availableImageGenerationMaxTasksCount = context.availableLoraModelsCount

  return (
    <>
      {0 < selectedModels.length && (
        <Accordion type="single" collapsible defaultValue="setting">
          <AccordionItem value="setting">
            <AccordionTrigger>
              <div className="flex text-left">
                <p>LoRA（エフェクト）詳細</p>
                <p>({selectedModels.length})</p>
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
