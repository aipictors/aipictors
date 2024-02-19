"use client"

import { ConfigModelButton } from "@/app/[lang]/generation/_components/editor-config-view/config-model-button"
import { GenerationModelsButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-models-button"
import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"

type Props = {
  models: ImageModelsQuery["imageModels"]
  currentModelId: string
  /**
   * 表示されるモデルのID（最大3個）
   */
  currentModelIds: string[]
  onSelectModelId(id: string, type: string): void
}

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationEditorConfigModels = (props: Props) => {
  const currentModels = props.currentModelIds.map((modelId) => {
    return props.models.find((model) => {
      return model.id === modelId
    })
  })

  return (
    <div className="grid gap-y-2">
      {currentModels.map((model) => (
        <ConfigModelButton
          key={model?.id}
          imageURL={model?.thumbnailImageURL ?? ""}
          name={model?.displayName ?? ""}
          isSelected={model?.id === props.currentModelId}
          onClick={() => {
            props.onSelectModelId(model!.id, model!.type)
          }}
        />
      ))}
      <GenerationModelsButton
        models={props.models}
        selectedModelId={props.currentModelId}
        onSelect={props.onSelectModelId}
      />
    </div>
  )
}
