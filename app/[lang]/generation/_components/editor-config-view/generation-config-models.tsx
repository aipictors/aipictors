"use client"

import { ConfigModelButton } from "@/app/[lang]/generation/_components/editor-config-view/config-model-button"
import { GenerationConfigFavoriteModeTabs } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-favorite-mode-tabs"
import { GenerationModelsButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-models-button"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { useState } from "react"

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationConfigModels = () => {
  const context = useGenerationContext()

  const [isFavoriteMode, setFavoriteMode] = useState(false)

  const currentModels = context.config.modelIds.map((modelId) => {
    return context.models.find((model) => {
      return model.id === modelId
    })
  })

  const favoritedModels = context.config.favoriteModelIds
    .map((modelId) => {
      return context.models.find((model) => {
        return Number(model.id) === modelId
      })
    })
    .slice(0, 3)

  return (
    <div className="grid gap-y-2">
      <GenerationConfigFavoriteModeTabs
        isActive={isFavoriteMode}
        setFavoriteMode={setFavoriteMode}
      />
      {!isFavoriteMode &&
        currentModels.map((model) => (
          <ConfigModelButton
            key={model?.id}
            imageURL={model?.thumbnailImageURL ?? ""}
            name={model?.displayName ?? ""}
            isSelected={model?.id === context.config.modelId}
            onClick={() => {
              context.updateModelId(model!.id, model!.type)
            }}
          />
        ))}
      {isFavoriteMode &&
        favoritedModels.map((model) => (
          <ConfigModelButton
            key={model?.id}
            imageURL={model?.thumbnailImageURL ?? ""}
            name={model?.displayName ?? ""}
            isSelected={model?.id === context.config.modelId}
            onClick={() => {
              context.updateModelId(model!.id, model!.type)
            }}
          />
        ))}
      <GenerationModelsButton
        favoritedModelIds={context.config.favoriteModelIds}
        models={context.models}
        selectedModelId={context.config.modelId}
        onSelect={context.updateModelId}
      />
    </div>
  )
}
