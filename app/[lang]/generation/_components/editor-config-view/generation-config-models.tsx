"use client"

import { ConfigModelButton } from "@/app/[lang]/generation/_components/editor-config-view/config-model-button"
import { GenerationModelListButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-model-list-button"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { CrossPlatformTooltip } from "@/app/_components/cross-platform-tooltip"
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

  /**
   * v2などのバージョン情報は残した状態でモデル名のアンダーバー以降の詳細文字列を削除する
   * @param input
   * @returns
   */
  const trimString = (input: string) => {
    const suffix = input.match(/_v\d+.*$/)?.[0]

    const underscoreIndex = input.indexOf("_")

    if (underscoreIndex !== -1) {
      return (
        input.substring(0, underscoreIndex) +
        (suffix !== undefined ? suffix : "")
      )
    }

    return input
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <h2 className="font-bold text-sm">{"モデル"}</h2>
        <CrossPlatformTooltip
          text={"イラストに使用するモデルです、絵柄を変更できます。"}
        />
      </div>
      <Tabs defaultValue="normal">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="normal">
            最近
          </TabsTrigger>
          <TabsTrigger className="w-full" value="favorite">
            お気に入り
          </TabsTrigger>
        </TabsList>
        <TabsContent value="normal">
          <div className="flex flex-col space-y-2">
            {currentModels.map((model) => (
              <ConfigModelButton
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={trimString(model?.displayName ?? "")}
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
          <div className="flex flex-col space-y-2">
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
    </>
  )
}
