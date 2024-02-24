"use client"

import { ConfigModelButton } from "@/app/[lang]/generation/_components/editor-config-view/config-model-button"
import { GenerationModelsButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-models-button"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"

type Props = {
  models: ImageModelsQuery["imageModels"]
  currentModelId: string
  favoritedModelIds: number[]
  showFavoritedModels: boolean
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
  const context = useGenerationContext()

  const currentModels = context.config.modelIds.map((modelId) => {
    return context.models.find((model) => {
      return model.id === modelId
    })
  })

  const favoritedModels = props.favoritedModelIds
    .map((modelId) => {
      return props.models.find((model) => {
        return Number(model.id) === modelId
      })
    })
    .slice(0, 3)

  return (
    <div className="grid gap-y-2">
      {!props.showFavoritedModels &&
        currentModels.map((model) => (
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
      {props.showFavoritedModels &&
        favoritedModels.map((model) => (
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
        favoritedModelIds={props.favoritedModelIds}
        models={props.models}
        selectedModelId={props.currentModelId}
        onSelect={props.onSelectModelId}
      />
    </div>
  )
}
