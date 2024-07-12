import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { ConfigModelButton } from "@/routes/($lang).generation._index/_components/config-view/config-model-button"
import { GenerationModelListButton } from "@/routes/($lang).generation._index/_components/config-view/generation-model-list-button"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { graphql, type ResultOf } from "gql.tada"
import { CheckIcon } from "lucide-react"

type Props = {
  models: ResultOf<typeof imageModelsQuery>["imageModels"]
  currentModelId: string
  favoritedModelIds: number[]
  /**
   * 表示されるモデルのID（最大3個）
   */
  currentModelIds: string[]
  onSelectModelId(id: string, type: string, prompt: string): void
  onClickSearchModelWorks(id: string, name: string): void
}

interface Model {
  id: string
  thumbnailImageURL?: string
  displayName?: string
  type: string
  prompts: string[]
}

/**
 * エディタの設定
 */
export const GenerationConfigModels = (props: Props) => {
  const context = useGenerationContext()

  // 直近で使用したモデル一覧
  // 既に表示されているモデルの中に選択中のモデルがあれば並び替えしない
  const currentModelIds = !context.config.modelIds.includes(
    props.currentModelId,
  )
    ? [
        Number(props.currentModelId),
        ...context.config.modelIds.filter(
          (id: string) => Number(id) !== Number(props.currentModelId),
        ),
      ]
    : context.config.modelIds

  // 表示する一覧を追加
  const currentModels = currentModelIds
    .map((modelId) => {
      return context.models.find((model) => {
        return Number(model.id) === Number(modelId)
      })
    })
    .slice(0, 3)
    .filter((model) => model !== undefined) as Model[]

  // 直近で使用したお気に入り一覧
  // 既に表示されているモデルの中に選択中のモデルがあれば並び替えしない
  const favoritedModelIds = !props.favoritedModelIds
    .slice(0, 3)
    .includes(Number(props.currentModelId))
    ? [
        Number(props.currentModelId),
        ...props.favoritedModelIds.filter(
          (id) => id !== Number(props.currentModelId),
        ),
      ]
    : props.favoritedModelIds

  // 表示する一覧を追加
  const favoritedModels = favoritedModelIds
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
            {currentModels.map((model: Model) => (
              <div className="relative" key={model?.id}>
                <ConfigModelButton
                  imageURL={model?.thumbnailImageURL ?? ""}
                  name={trimString(model?.displayName ?? "")}
                  isSelected={model?.id === props.currentModelId}
                  onClick={() => {
                    if (model) {
                      props.onSelectModelId(
                        model?.id,
                        model?.type,
                        model?.prompts.join(",") ?? "",
                      )
                    }
                  }}
                  onSearchClick={() => {
                    if (model) {
                      props.onClickSearchModelWorks(
                        model?.id,
                        model?.displayName ?? "",
                      )
                    }
                  }}
                />
                {model?.id === props.currentModelId && (
                  <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
                    <CheckIcon className="p-1 text-white dark:text-black" />
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
              <div className="relative" key={model?.id}>
                <ConfigModelButton
                  imageURL={model?.thumbnailImageURL ?? ""}
                  name={trimString(model?.displayName ?? "")}
                  isSelected={model?.id === props.currentModelId}
                  onClick={() => {
                    if (model) {
                      props.onSelectModelId(
                        model?.id,
                        model?.type,
                        model?.prompts.join(",") ?? "",
                      )
                    }
                  }}
                  onSearchClick={() => {
                    if (model) {
                      props.onClickSearchModelWorks(
                        model?.id,
                        model?.displayName ?? "",
                      )
                    }
                  }}
                />
                {model?.id === props.currentModelId && (
                  <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
                    <CheckIcon className={"p-1 text-white dark:text-black"} />
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

export const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      id
      name
      displayName
      category
      description
      license
      prompts
      slug
      style
      thumbnailImageURL
      type
    }
  }`,
)
