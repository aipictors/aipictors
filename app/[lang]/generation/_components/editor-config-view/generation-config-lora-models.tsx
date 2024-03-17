"use client"

import { ConfigLoraModel } from "@/app/[lang]/generation/_components/editor-config-view/config-lora-model"
import { LoraModelListDialogButton } from "@/app/[lang]/generation/_components/editor-config-view/lora-model-list-dialog-button"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { useBoolean } from "usehooks-ts"

export const GenerationConfigLoraModels = () => {
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
  const selectedModels = context.loraModels.filter((model) => {
    return currentLoraModelNames.includes(model.name)
  })

  /**
   * 使用可能なLoRA数
   */
  const availableImageGenerationMaxTasksCount = context.availableLoraModelsCount

  return (
    <div className="space-y-2">
      {selectedModels.map((model) => (
        <ConfigLoraModel
          key={model.id}
          imageURL={model.thumbnailImageURL ?? ""}
          name={model.name}
          description={model.description ?? ""}
          value={currentModels.find((m) => m.name === model.name)?.value ?? 0}
          setValue={(value) => {
            context.updateLoraModel(model.name, value)
          }}
          onDelete={() => {
            context.changeLoraModel(model.name)
          }}
        />
      ))}
      <LoraModelListDialogButton
        isOpen={isOpen}
        models={context.loraModels}
        selectedModelNames={currentLoraModelNames}
        availableImageGenerationMaxTasksCount={
          availableImageGenerationMaxTasksCount
        }
        onClose={onClose}
        onSelect={context.changeLoraModel}
      />
    </div>
  )
}
