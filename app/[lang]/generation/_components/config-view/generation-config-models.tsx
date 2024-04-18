import { ConfigModelButton } from "@/[lang]/generation/_components/config-view/config-model-button"
import { GenerationModelListButton } from "@/[lang]/generation/_components/config-view/generation-model-list-button"
import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import type { ImageModelsQuery } from "@/_graphql/__generated__/graphql"
import { CheckIcon } from "lucide-react"
import { useTheme } from "remix-themes"

type Props = {
  models: ImageModelsQuery["imageModels"]
  currentModelId: string
  favoritedModelIds: number[]
  /**
   * 表示されるモデルのID（最大3個）
   */
  currentModelIds: string[]
  onSelectModelId(id: string, type: string, prompt: string): void
  onClickSearchModelWorks(id: string, name: string): void
}

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationConfigModels = (props: Props) => {
  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const { theme, systemTheme } = useTheme()

  const currentTheme = theme === "system" ? systemTheme : theme

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
    if (input === "blue_pencil-v10") {
      return "blue_pencil"
    }
    if (input === "lametta_v1745_fp16") {
      return "lametta"
    }

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
              <div className="relative" key={model?.id}>
                <ConfigModelButton
                  key={model?.id}
                  imageURL={model?.thumbnailImageURL ?? ""}
                  name={trimString(model?.displayName ?? "")}
                  isSelected={model?.id === props.currentModelId}
                  onClick={() => {
                    props.onSelectModelId(
                      model?.id,
                      model?.type,
                      model?.prompts.join(",") ?? "",
                    )
                  }}
                  onSearchClick={() => {
                    props.onClickSearchModelWorks(
                      model?.id,
                      model?.displayName ?? "",
                    )
                  }}
                />
                {model?.id === props.currentModelId && (
                  <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
                    <CheckIcon
                      className="p-1"
                      color={currentTheme === "light" ? "white" : "black"}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <GenerationModelListButton
              isInitFavorited={false}
              favoritedModelIds={props.favoritedModelIds}
              models={props.models}
              selectedModelId={props.currentModelId}
              onSelect={props.onSelectModelId}
              onSearchClick={props.onClickSearchModelWorks}
            />
          </div>
        </TabsContent>
        <TabsContent value="favorite">
          <div className="flex flex-col space-y-2">
            {favoritedModels.map((model) => (
              <div className="relative">
                <ConfigModelButton
                  key={model?.id}
                  imageURL={model?.thumbnailImageURL ?? ""}
                  name={trimString(model?.displayName ?? "")}
                  isSelected={model?.id === props.currentModelId}
                  onClick={() => {
                    props.onSelectModelId(
                      model?.id,
                      model?.type,
                      model?.prompts.join(",") ?? "",
                    )
                  }}
                  onSearchClick={() => {
                    props.onClickSearchModelWorks(
                      model?.id,
                      model?.displayName ?? "",
                    )
                  }}
                />
                {model?.id === props.currentModelId && (
                  <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
                    <CheckIcon
                      className="p-1"
                      color={currentTheme === "light" ? "white" : "black"}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <GenerationModelListButton
              label="すべてのお気に入りモデル"
              isInitFavorited={true}
              favoritedModelIds={props.favoritedModelIds}
              models={props.models}
              selectedModelId={props.currentModelId}
              onSelect={props.onSelectModelId}
              onSearchClick={props.onClickSearchModelWorks}
            />{" "}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
