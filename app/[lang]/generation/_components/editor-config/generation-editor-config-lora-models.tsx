"use client"

import { ConfigLoraModel } from "@/app/[lang]/generation/_components/config-lora-model"
import { LoraModelsDialogButton } from "@/app/[lang]/generation/_components/lora-models-dialog-button"
import type { ImageLoraModelsQuery } from "@/graphql/__generated__/graphql"
import { useBoolean } from "usehooks-ts"

type Props = {
  /**
   * 全てのモデル
   */
  models: ImageLoraModelsQuery["imageLoraModels"]
  /**
   * モデルの設定
   */
  loraModels: string[]
  availableLoraModelsCount: number
  onChangeLoraModel(modelName: string): void
  onUpdateLoraModel(modelName: string, value: number): void
}

export const GenerationEditorConfigLoraModels = (props: Props) => {
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
  const selectedModels = props.models.filter((model) => {
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
        models={props.models}
        selectedModelNames={currentLoraModelNames}
        onSelect={props.onChangeLoraModel}
      />
    </div>
  )
}
