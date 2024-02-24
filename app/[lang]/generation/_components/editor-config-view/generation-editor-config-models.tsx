"use client"

import { ConfigModelButton } from "@/app/[lang]/generation/_components/editor-config-view/config-model-button"
import { GenerationModelsButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-models-button"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationEditorConfigModels = () => {
  const context = useGenerationContext()

  const currentModels = context.config.modelIds.map((modelId) => {
    return context.models.find((model) => {
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
          isSelected={model?.id === context.config.modelId}
          onClick={() => {
            context.updateModelId(model!.id, model!.type)
          }}
        />
      ))}
      <GenerationModelsButton
        models={context.models}
        selectedModelId={context.config.modelId}
        onSelect={context.updateModelId}
      />
    </div>
  )
}
