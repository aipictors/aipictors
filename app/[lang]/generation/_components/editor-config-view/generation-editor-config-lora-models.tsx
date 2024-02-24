"use client"

import { ConfigLoraModel } from "@/app/[lang]/generation/_components/editor-config-view/config-lora-model"
import { LoraModelsDialogButton } from "@/app/[lang]/generation/_components/editor-config-view/lora-models-dialog-button"
import { generationDataContext } from "@/app/[lang]/generation/_contexts/generation-data-context"
import { useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  loraModels: string[]
  availableLoraModelsCount: number
  onChangeLoraModel(modelName: string): void
  onUpdateLoraModel(modelName: string, value: number): void
}

export const GenerationEditorConfigLoraModels = (props: Props) => {
  const dataContext = useContext(generationDataContext)

  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const currentModels = props.loraModels.map((model) => {
    const [name, value] = model.split(":")
    return { name, value: parseFloat(value) }
  })

  const currentLoraModelNames = props.loraModels.map((model) => {
    const [name] = model.split(":")
    return name
  })

  /**
   * 選択されたLoRAモデル
   */
  const selectedModels = dataContext.loraModels.filter((model) => {
    return currentLoraModelNames.includes(model.name)
  })

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
            props.onUpdateLoraModel(model.name, value)
          }}
          onDelete={() => {
            props.onChangeLoraModel(model.name)
          }}
        />
      ))}
      <LoraModelsDialogButton
        isOpen={isOpen}
        onClose={onClose}
        models={dataContext.loraModels}
        selectedModelNames={currentLoraModelNames}
        onSelect={props.onChangeLoraModel}
      />
    </div>
  )
}
