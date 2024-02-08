"use client"

import { ConfigLoraModel } from "@/app/[lang]/(beta)/generation/_components/config-lora-model"
import { LoraModelsDialog } from "@/app/[lang]/(beta)/generation/_components/lora-models-dialog"
import { Button } from "@/components/ui/button"
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
  loraModels: { name: string; value: number }[]
  availableLoraModelsCount: number
  onAddLoraModel(modelName: string): void
  onUpdateLoraModel(modelName: string, value: number): void
}

export const GenerationEditorConfigLoraModels = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const selectedModelNames = props.loraModels.map((model) => model.name)

  /**
   * 選択されたLoRAモデル
   */
  const selectedModels = selectedModelNames.map((name) => {
    const model = props.models.find((model) => model.name === name)
    if (model === undefined) {
      throw new Error()
    }
    return model
  })

  return (
    <div className="space-y-2">
      {selectedModels.map((model) => (
        <ConfigLoraModel
          key={model.id}
          imageURL={model.thumbnailImageURL ?? ""}
          name={model.name}
          description={model.description ?? ""}
          value={
            props.loraModels.find((m) => m.name === model.name)?.value ?? 0
          }
          setValue={(value) => {
            props.onUpdateLoraModel(model.name, value)
          }}
          onDelete={() => {
            props.onAddLoraModel(model.name)
          }}
        />
      ))}
      <LoraModelsDialog
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelNames={selectedModelNames}
        onSelect={props.onAddLoraModel}
      >
        <Button size={"sm"} className="w-full" variant={"secondary"}>
          LoRAを追加
        </Button>
      </LoraModelsDialog>
    </div>
  )
}
