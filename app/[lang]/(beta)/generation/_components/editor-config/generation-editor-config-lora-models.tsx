"use client"

import type { ImageLoraModelsQuery } from "@/__generated__/apollo"
import { ConfigLoraModel } from "@/app/[lang]/(beta)/generation/_components/config-lora-model"
import { LoraModelsDialog } from "@/app/[lang]/(beta)/generation/_components/lora-models-dialog"
import { Button } from "@/components/ui/button"
import { useBoolean } from "usehooks-ts"

type Props = {
  /**
   * 全てのモデル
   */
  models: ImageLoraModelsQuery["imageLoraModels"]
  /**
   * モデルの設定
   */
  modelConfigs: { id: string; value: number }[]
  /**
   * 設定を変更する
   * @param configs 設定
   */
  onChangeModelConfigs(configs: { id: string; value: number }[]): void
}

export const GenerationEditorConfigLoraModels = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const selectedModelIds = props.modelConfigs.map((model) => model.id)

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

  /**
   * LoRAモデルを追加する
   * @param modelId
   */
  const onAddModelConfig = (modelId: string) => {
    const modelIds = props.modelConfigs.map((model) => model.id)
    const draftModelIds = [...modelIds]
    const index = draftModelIds.indexOf(modelId)
    if (index === -1) {
      draftModelIds.push(modelId)
    }
    if (index !== -1) {
      draftModelIds.splice(index, 1)
    }
    // TODO: プランによって個数をかえる
    // 3つ以上選択されたら、最初の要素を削除する
    if (draftModelIds.length > 2) {
      draftModelIds.shift()
    }
    const draftModels = draftModelIds.map((id) => {
      const model = selectedModels.find((model) => model.id === id)
      if (model !== undefined) {
        return { id: model.id, value: 0 }
      }
      return { id, value: 0 }
    })
    props.onChangeModelConfigs(draftModels)
  }

  /**
   * モデルの設定を変更する
   * @param modelId
   * @param value
   */
  const onChangeModelConfig = (modelId: string, value: number) => {
    const draftConfigs = props.modelConfigs.map((config) => {
      if (config.id === modelId) {
        return { id: modelId, value }
      }
      return config
    })
    props.onChangeModelConfigs(draftConfigs)
  }

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
              props.modelConfigs.find((m) => m.id === model.id)?.value ?? 0
            }
            setValue={(value) => {
              onChangeModelConfig(model.id, value)
            }}
            onDelete={() => {
              onAddModelConfig(model.id)
            }}
          />
        ))}
        <Button size={"sm"} className="w-full" onClick={onOpen}>
          {"LoRAを追加する"}
        </Button>
      </div>
      <LoraModelsDialog
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelIds={selectedModelIds}
        onSelect={onAddModelConfig}
      />
    </>
  )
}
