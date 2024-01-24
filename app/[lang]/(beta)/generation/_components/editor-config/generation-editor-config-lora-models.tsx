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
  loraModels: { modelId: string; value: number }[]
  onAddLoraModel(modelId: string): void
  onUpdateLoraModel(modelId: string, value: number): void
}

export const GenerationEditorConfigLoraModels = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const selectedModelIds = props.loraModels.map((model) => model.modelId)

  /**
   * 選択されたLoRAモデル
   */
  const selectedModels = selectedModelIds.map((id) => {
    const model = props.models.find((model) => model.id === id)
    if (model === undefined) {
      throw new Error()
    }
    return model
  })

  return (
    <>
      <div className="space-y-4">
        {selectedModels.map((model) => (
          <ConfigLoraModel
            key={model.id}
            imageURL={model.thumbnailImageURL ?? ""}
            name={model.name}
            description={model.description ?? ""}
            value={
              props.loraModels.find((m) => m.modelId === model.id)?.value ?? 0
            }
            setValue={(value) => {
              props.onUpdateLoraModel(model.id, value)
            }}
            onDelete={() => {
              props.onAddLoraModel(model.id)
            }}
          />
        ))}
        <Button
          variant={"secondary"}
          size={"sm"}
          className="w-full"
          onClick={onOpen}
        >
          {"LoRAを追加する"}
        </Button>
      </div>
      <LoraModelsDialog
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelIds={selectedModelIds}
        onSelect={props.onAddLoraModel}
      />
    </>
  )
}
