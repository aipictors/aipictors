import {} from "~/components/ui/accordion"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AuthContext } from "~/contexts/auth-context"
import { GenerationConfigSize } from "~/routes/($lang).generation._index/components/config-view/generation-config-size"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useEffect, useState } from "react"
import { useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * エディタの設定
 * ローカルストレージにより設定内容が保存されて、復元されるのでサーバレンダリングと
 * クライアントレンダリングの不一致を解決するため遅延インポートで本コンポーネントを読み込むこと
 */
export function GenerationDemoConfigView() {
  const context = useGenerationContext()

  const queryData = useGenerationQuery()

  const { send } = GenerationConfigContext.useActorRef()

  const authContext = useContext(AuthContext)

  const [showMemoSetting, setShowMemoSetting] = useState(false)

  /**
   * 選択中のモデル
   */
  const currentModel = context.imageModels.find((model) => {
    return model.id === context.config.modelId
  })

  /**
   * お気に入りのモデル
   */
  const { data: userSetting, refetch: refetchSetting } = useQuery(
    userSettingQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  /**
   * モデルの種類
   * SD1など
   */
  const configModelType = currentModel?.type ?? "SD1"

  /**
   * メモ一覧
   */
  const { data: memos, refetch } = useQuery(
    viewerCurrentImageGenerationMemosQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  /**
   * お気に入りのモデル一覧
   */
  const { data: favoritedModels } = useQuery(
    viewerFavoritedImageGenerationModelsQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  /**
   * 最大生成枚数
   */
  const availableImageGenerationMaxTasksCount =
    queryData.userStatus?.availableImageGenerationMaxTasksCount ?? 10

  const inProgressImageGenerationTasksCost =
    queryData.userStatus?.inProgressImageGenerationTasksCost ?? 0

  const remainingImageGenerationTasksCount =
    queryData.userStatus?.remainingImageGenerationTasksCount ?? 0

  useEffect(() => {
    if (authContext.isLoading) return
    if (authContext.isNotLoggedIn) return
    if (favoritedModels === undefined) return
    const favoritedModelIds =
      favoritedModels.viewer?.favoritedImageGenerationModels.map((model) =>
        Number(model.id),
      ) ?? []
    context.updateFavoriteModelIds(favoritedModelIds)
  }, [favoritedModels])

  useEffect(() => {
    // 初期化
    context.resetForInit()
  }, [])

  const t = useTranslation()

  // modelsについてfluxという名前のモデルで絞る
  const fluxModels = context.imageModels.filter((model) => {
    // model.nameがfluxを含むかどうか
    return model.name.includes("flux.1 schnell")
  })

  return (
    <GenerationViewCard>
      <ScrollArea type="always">
        <div className={"flex flex-col gap-y-4 px-0 md:px-4"}>
          {/* <GenerationConfigModels
            models={fluxModels}
            favoritedModelIds={context.config.favoriteModelIds}
            currentModelId={"706"}
            currentModelIds={["706"]}
            onSelectModelId={(id: string, type: string, prompt: string) => {
              if (context.config.isUseRecommendedPrompt) {
                if (prompt === "") {
                  context.updateModelIdAndPrompt(
                    id,
                    type,
                    config.generationFeature.defaultPromptValue,
                  )
                } else {
                  context.updateModelIdAndPrompt(id, type, prompt)
                }
              } else {
                context.updateModelId(id, type)
              }
            }}
            onClickSearchModelWorks={(id: string, name: string) => {
              context.updateSearchWorksModelIdAndName(id, name)
              send({ type: "OPEN_WORKS_FROM_MODEL" })
            }}
          /> */}
          {/* <Separator /> */}
          {/* <GenerationConfigCount
            availableImageGenerationMaxTasksCount={
              availableImageGenerationMaxTasksCount
            }
            tasksCount={
              inProgressImageGenerationTasksCost +
              remainingImageGenerationTasksCount
            }
            setGenerationCount={context.changeGenerationCount}
            generationCount={context.config.generationCount}
          /> */}
          <GenerationConfigSize
            modelType={configModelType}
            value={context.config.sizeType}
            onChange={context.updateSizeType}
          />
          {/* <GenerationConfigUpscale /> */}
          {/* <Separator />
          <GenerationConfigI2i />
          <Separator />
          <GenerationConfigControlNet />
          <Separator /> */}
          {/* <GenerationConfigSeed
            value={context.config.seed}
            onChange={context.updateSeed}
          />
          <Separator />
          <Accordion type="single" collapsible>
            <AccordionItem value="setting">
              <AccordionTrigger>
                <div className="text-left">
                  <p>{t("詳細設定", "Detailed settings")}</p>
                  <p className="text-sm opacity-40">
                    Scale:{context.config.scale}, Steps:{context.config.steps},
                    Sampler:{context.config.sampler}, Vae:{context.config.vae}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <GenerationConfigScale
                  value={context.config.scale}
                  onChange={context.updateScale}
                />
                <GenerationConfigStep
                  value={context.config.steps}
                  onChange={context.updateSteps}
                />
                <GenerationConfigSampler
                  value={context.config.sampler}
                  onChange={context.updateSampler}
                />
                <GenerationConfigClipSkip
                  value={context.config.clipSkip}
                  onChange={context.updateClipSkip}
                />
                <GenerationConfigVae
                  value={context.config.vae ?? ""}
                  onChange={context.updateVae}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion> */}
        </div>
      </ScrollArea>
      {/* <div className="bottom-0 bg-card p-4 lg:sticky">
        <div className="flex gap-x-2">
          <GenerationConfigMemoButton
            onClick={() => {
              setShowMemoSetting(true)
            }}
          />
          <GenerationConfigMemoSettingDialog
            memos={
              memos?.viewer?.currentImageGenerationMemos.map((memo) => ({
                ...memo,
                model: {
                  ...memo.model,
                  recommendedPrompt: "",
                },
              })) ?? []
            }
            refetch={refetch}
            onClose={() => {
              setShowMemoSetting(false)
            }}
            isOpen={showMemoSetting}
          />
          <GenerationConfigResetConfirmDialog onReset={context.reset} />
        </div>
      </div> */}
    </GenerationViewCard>
  )
}

const userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      userId
      favoritedImageGenerationModelIds
      preferenceRating
      featurePromptonRequest
      isAnonymousLike
      isAnonymousSensitiveLike
      isNotifyComment
    }
  }`,
)

const viewerCurrentImageGenerationMemosQuery = graphql(
  `query ViewerCurrentImageGenerationMemos {
    viewer {
      id
      currentImageGenerationMemos {
        id
        nanoid
        userId
        title
        explanation
        prompts
        negativePrompts
        sampler
        model {
          id
          name
          type
        }
        vae
        seed
        steps
        scale
        clipSkip
        width
        height
        isDeleted
        createdAt
      }
    }
  }`,
)

const viewerFavoritedImageGenerationModelsQuery = graphql(
  `query ViewerFavoritedImageGenerationModels {
    viewer {
      id
      favoritedImageGenerationModels {
        id
        name
        type
      }
    }
  }`,
)