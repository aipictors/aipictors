import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { cn } from "~/lib/cn"
import { config } from "~/config"
import { GenerationConfigClipSkip } from "~/routes/($lang).generation._index/components/config-view/generation-config-clip-skip"
import { GenerationConfigControlNet } from "~/routes/($lang).generation._index/components/config-view/generation-config-control-net"
import { GenerationConfigCount } from "~/routes/($lang).generation._index/components/config-view/generation-config-count"
import { GenerationConfigI2i } from "~/routes/($lang).generation._index/components/config-view/generation-config-i2i"
import { GenerationConfigLoraModels } from "~/routes/($lang).generation._index/components/config-view/generation-config-lora-models"
import { GenerationConfigMemoButton } from "~/routes/($lang).generation._index/components/config-view/generation-config-memo-button"
import { GenerationConfigMemoSettingDialog } from "~/routes/($lang).generation._index/components/config-view/generation-config-memo-setting-dialog"
import { GenerationConfigModels } from "~/routes/($lang).generation._index/components/config-view/generation-config-models"
import { GenerationConfigResetButton } from "~/routes/($lang).generation._index/components/config-view/generation-config-reset-button"
import { GenerationConfigSampler } from "~/routes/($lang).generation._index/components/config-view/generation-config-sampler"
import { GenerationConfigScale } from "~/routes/($lang).generation._index/components/config-view/generation-config-scale"
import { GenerationConfigSeed } from "~/routes/($lang).generation._index/components/config-view/generation-config-seed"
import { GenerationConfigSize } from "~/routes/($lang).generation._index/components/config-view/generation-config-size"
import { GenerationConfigStep } from "~/routes/($lang).generation._index/components/config-view/generation-config-step"
import { GenerationConfigUpscale } from "~/routes/($lang).generation._index/components/config-view/generation-config-upscale"
import { GenerationConfigVae } from "~/routes/($lang).generation._index/components/config-view/generation-config-vae"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useEffect, useState } from "react"
import { useContext } from "react"

/**
 * エディタの設定
 * ローカルストレージにより設定内容が保存されて、復元されるのでサーバレンダリングと
 * クライアントレンダリングの不一致を解決するため遅延インポートで本コンポーネントを読み込むこと
 */
export function GenerationConfigView() {
  const context = useGenerationContext()

  const queryData = useGenerationQuery()

  const { send } = GenerationConfigContext.useActorRef()

  const authContext = useContext(AuthContext)

  const [showMemoSetting, setShowMemoSetting] = useState(false)

  /**
   * 選択中のモデル
   */
  const currentModel = context.models.find((model) => {
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
    queryData.viewer.availableImageGenerationMaxTasksCount ?? 10

  const inProgressImageGenerationTasksCost =
    queryData.viewer.inProgressImageGenerationTasksCost ?? 0

  const remainingImageGenerationTasksCount =
    queryData.viewer.remainingImageGenerationTasksCount

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

  return (
    <GenerationViewCard
      title={"モデル"}
      tooltip={"イラストに使用するモデルです、絵柄を変更できます。"}
    >
      <ScrollArea type="always">
        <div
          className={cn(
            "flex flex-col gap-y-4 px-0 md:px-4 md:max-h-[100vh]",
            "max-h-auto md:max-h-full",
          )}
        >
          <GenerationConfigModels
            models={context.models}
            favoritedModelIds={context.config.favoriteModelIds}
            currentModelId={context.config.modelId}
            currentModelIds={context.config.modelIds}
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
          />
          <Separator />
          <GenerationConfigLoraModels />
          <Separator />
          <GenerationConfigCount
            availableImageGenerationMaxTasksCount={
              availableImageGenerationMaxTasksCount
            }
            tasksCount={
              inProgressImageGenerationTasksCost +
              remainingImageGenerationTasksCount
            }
            setGenerationCount={context.changeGenerationCount}
            generationCount={context.config.generationCount}
          />
          <GenerationConfigSize
            modelType={configModelType}
            value={context.config.sizeType}
            onChange={context.updateSizeType}
          />
          <GenerationConfigUpscale />
          <Separator />
          <GenerationConfigI2i />
          <Separator />
          <GenerationConfigControlNet />
          <Separator />
          <GenerationConfigSeed
            value={context.config.seed}
            onChange={context.updateSeed}
          />
          <Separator />
          <Accordion type="single" collapsible>
            <AccordionItem value="setting">
              <AccordionTrigger>
                <div className="text-left">
                  <p>詳細設定</p>
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
          </Accordion>
        </div>
      </ScrollArea>
      <div className="bottom-0 bg-card p-4 lg:sticky">
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
          <GenerationConfigResetButton onReset={context.reset} />
        </div>
      </div>
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
