"use client"

import { ConfigModel } from "@/app/[lang]/(beta)/generation/_components/config-model"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationModelsButton } from "@/app/[lang]/(beta)/generation/_components/generation-models-button"
import { ScrollArea } from "@/components/ui/scroll-area"
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

export const GenerationEditorModels = (props: Props) => {
  const currentModels = props.currentModelIds.map((modelId) => {
    return props.models.find((model) => {
      return model.id === modelId
    })
  })

  /**
   * モデルを追加する
   * 選択中のモデルが3個未満の場合は末尾に追加する
   * 3個以上の場合は選択中のモデルを置換する
   * @param modelId
   */
  const onSelectModelId = (modelId: string, modelType: string) => {
    props.onSelectModelId(modelId, modelType)
  }

  return (
    <>
      <GenerationEditorCard
        title={"モデル"}
        tooltip={"イラスト生成に使用するモデルです。絵柄などが変わります。"}
      >
        <ScrollArea>
          <div className="px-2 grid gap-y-2 pb-2">
            <GenerationModelsButton
              models={props.models}
              selectedModelId={props.currentModelId}
              onSelect={onSelectModelId}
            />
            {currentModels.map((model) => (
              <ConfigModel
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={model?.displayName ?? ""}
                isSelected={model?.id === props.currentModelId}
                onClick={() => {
                  onSelectModelId(model!.id, model!.type)
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </GenerationEditorCard>
    </>
  )
}
