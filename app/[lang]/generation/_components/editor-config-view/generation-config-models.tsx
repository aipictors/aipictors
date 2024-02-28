"use client"

import { ConfigModelButton } from "@/app/[lang]/generation/_components/editor-config-view/config-model-button"
import { GenerationModelListButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-model-list-button"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"

type Props = {
  models: ImageModelsQuery["imageModels"]
  currentModelId: string
  favoritedModelIds: number[]
  /**
   * 表示されるモデルのID（最大3個）
   */
  currentModelIds: string[]
  onSelectModelId(id: string, type: string, prompt: string): void
}

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationConfigModels = (props: Props) => {
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
    <div className="max-w-[100%] w-full 2xl:max-w-72 xl:max-w-72 lg:max-w-72 md:max-w-[100%] sm:max-w-[100%]">
      <Tabs className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="normal">
            最近
          </TabsTrigger>
          <TabsTrigger className="w-full" value="favorite">
            お気に入り
          </TabsTrigger>
        </TabsList>
        <TabsContent value="normal">
          <div className="space-y-2">
            {currentModels.map((model) => (
              <ConfigModelButton
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={model?.displayName ?? ""}
                isSelected={model?.id === props.currentModelId}
                onClick={() => {
                  props.onSelectModelId(
                    model!.id,
                    model!.type,
                    model?.prompts.join(",") ?? "",
                  )
                }}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="favorite">
          <div className="space-y-2">
            {favoritedModels.map((model) => (
              <ConfigModelButton
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={model?.displayName ?? ""}
                isSelected={model?.id === props.currentModelId}
                onClick={() => {
                  props.onSelectModelId(
                    model!.id,
                    model!.type,
                    model?.prompts.join(",") ?? "",
                  )
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <GenerationModelListButton
        favoritedModelIds={props.favoritedModelIds}
        models={props.models}
        selectedModelId={props.currentModelId}
        onSelect={props.onSelectModelId}
      />
    </div>
  )
}
