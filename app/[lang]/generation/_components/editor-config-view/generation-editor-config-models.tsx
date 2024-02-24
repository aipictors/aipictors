"use client"

import { ConfigModelButton } from "@/app/[lang]/generation/_components/editor-config-view/config-model-button"
import { GenerationModelsButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-models-button"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"

type Props = {
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
  const editor = useGenerationEditor()

  const currentModels = props.currentModelIds.map((modelId) => {
    return editor.models.find((model) => {
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
        models={editor.models}
        selectedModelId={props.currentModelId}
        onSelect={props.onSelectModelId}
      />
    </div>
  )
}
