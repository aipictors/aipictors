import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { toGenerationModelType } from "~/lib/user-models/generation"
import { GenerationConfigClipSkip } from "~/routes/($lang).generation._index/components/config-view/generation-config-clip-skip"
import { GenerationConfigCount } from "~/routes/($lang).generation._index/components/config-view/generation-config-count"
import { GenerationConfigMemoButton } from "~/routes/($lang).generation._index/components/config-view/generation-config-memo-button"
import { GenerationConfigMemoSettingDialog } from "~/routes/($lang).generation._index/components/config-view/generation-config-memo-setting-dialog"
import { GenerationConfigReferenceImage } from "~/routes/($lang).generation._index/components/config-view/generation-config-reference-image"
import { GenerationConfigResetConfirmDialog } from "~/routes/($lang).generation._index/components/config-view/generation-config-reset-confirm-dialog"
import { GenerationConfigSampler } from "~/routes/($lang).generation._index/components/config-view/generation-config-sampler"
import { GenerationConfigScale } from "~/routes/($lang).generation._index/components/config-view/generation-config-scale"
import { GenerationConfigSeed } from "~/routes/($lang).generation._index/components/config-view/generation-config-seed"
import { GenerationConfigSize } from "~/routes/($lang).generation._index/components/config-view/generation-config-size"
import { GenerationConfigStep } from "~/routes/($lang).generation._index/components/config-view/generation-config-step"
import { GenerationConfigUpscale } from "~/routes/($lang).generation._index/components/config-view/generation-config-upscale"
import { GenerationConfigVae } from "~/routes/($lang).generation._index/components/config-view/generation-config-vae"
import { GenerationLoraSection } from "~/routes/($lang).generation._index/components/config-view/generation-lora-section"
import { GenerationModelLibraryProvider } from "~/routes/($lang).generation._index/components/config-view/generation-model-library-provider"
import { GenerationModelSection } from "~/routes/($lang).generation._index/components/config-view/generation-model-section"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

/**
 * エディタの設定
 * ローカルストレージにより設定内容が保存されて、復元されるのでサーバレンダリングと
 * クライアントレンダリングの不一致を解決するため遅延インポートで本コンポーネントを読み込むこと
 */
type Props = {
  /**
   * 2カラムの左列に縦積みするとき（内部スクロールをなくす）
   */
  isStacked?: boolean
}

export function GenerationConfigView(props: Props) {
  const context = useGenerationContext()

  const queryData = useGenerationQuery()

  const { send } = GenerationConfigContext.useActorRef()

  const authContext = useContext(AuthContext)

  const [showMemoSetting, setShowMemoSetting] = useState(false)

  const userModelSelection = useUserModelSelection()

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
  const configModelType = userModelSelection.checkpoint
    ? toGenerationModelType(userModelSelection.checkpoint.baseModel)
    : (currentModel?.type ?? "SD1")

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

  const configBody = (
    <>
      <GenerationModelSection
        onClickSearchModelWorks={(id: string, name: string) => {
          context.updateSearchWorksModelIdAndName(id, name)
          send({ type: "OPEN_WORKS_FROM_MODEL" })
        }}
      />
      <GenerationLoraSection />
      <Separator />
      <GenerationConfigCount
        remainingImageGenerationTasksCount={remainingImageGenerationTasksCount}
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
      <GenerationConfigReferenceImage />
      <Separator />
      <GenerationConfigSeed
        value={context.config.seed}
        onChange={context.updateSeed}
      />
      <Separator />
      <Accordion type="single" collapsible>
        <AccordionItem value="setting">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="text-left">
              <p className="font-semibold text-sm">
                {t("詳細設定", "Detailed settings")}
              </p>
              <p className="mt-0.5 font-normal text-muted-foreground text-xs">
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
    </>
  )

  return (
    <GenerationModelLibraryProvider>
      <GenerationViewCard
        title={t("生成設定", "Settings")}
        tooltip={t(
          "モデルで絵柄が変わります。「モデルを管理」から自分のモデルのアップロードや整理ができます。",
          'The model changes the style. Use "Manage" to upload and organize your own models.',
        )}
      >
        {props.isStacked ? (
          <div className="flex flex-col gap-y-5 px-0 pb-1 md:px-4">
            {configBody}
          </div>
        ) : (
          <ScrollArea
            type="always"
            // Radix の table 表示だと横長の行で幅が広がるため block にする
            className="[&_[data-radix-scroll-area-viewport]>div]:!block"
          >
            <div
              className={
                "flex max-h-[100vh] flex-col gap-y-5 pr-3 pl-0 md:px-4"
              }
            >
              {configBody}
            </div>
          </ScrollArea>
        )}
        <div className="bottom-0 border-t bg-card px-4 py-3 lg:sticky">
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
        </div>
      </GenerationViewCard>
    </GenerationModelLibraryProvider>
  )
}

const userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      userId
      favoritedImageGenerationModelIds
      preferenceRating
      featurePromptonRequest
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
