"use client"

import { GenerationConfigClipSkip } from "@/app/[lang]/generation/_components/config-view/generation-config-clip-skip"
import { GenerationConfigI2i } from "@/app/[lang]/generation/_components/config-view/generation-config-i2i"
import { GenerationConfigLoraModels } from "@/app/[lang]/generation/_components/config-view/generation-config-lora-models"
import { GenerationConfigMemoButton } from "@/app/[lang]/generation/_components/config-view/generation-config-memo-button"
import { GenerationConfigMemoSettingDialog } from "@/app/[lang]/generation/_components/config-view/generation-config-memo-setting-dialog"
import { GenerationConfigModels } from "@/app/[lang]/generation/_components/config-view/generation-config-models"
import { GenerationConfigResetButton } from "@/app/[lang]/generation/_components/config-view/generation-config-reset-button"
import { GenerationConfigSampler } from "@/app/[lang]/generation/_components/config-view/generation-config-sampler"
import { GenerationConfigScale } from "@/app/[lang]/generation/_components/config-view/generation-config-scale"
import { GenerationConfigSeed } from "@/app/[lang]/generation/_components/config-view/generation-config-seed"
import { GenerationConfigSize } from "@/app/[lang]/generation/_components/config-view/generation-config-size"
import { GenerationConfigStep } from "@/app/[lang]/generation/_components/config-view/generation-config-step"
import { GenerationConfigVae } from "@/app/[lang]/generation/_components/config-view/generation-config-vae"
import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AuthContext } from "@/app/_contexts/auth-context"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { config } from "@/config"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { userSettingQuery } from "@/graphql/queries/user/user-setting"
import { viewerCurrentImageGenerationMemosQuery } from "@/graphql/queries/viewer/viewer-current-image-generation-memos"
import { viewerFavoritedImageGenerationModelsQuery } from "@/graphql/queries/viewer/viewer-favorited-image-generation-models"
import { cn } from "@/lib/utils"
import { skipToken, useQuery, useSuspenseQuery } from "@apollo/client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useContext } from "react"
import { toast } from "sonner"

/**
 * エディタの設定
 * ローカルストレージにより設定内容が保存されて、復元されるのでサーバレンダリングと
 * クライアントレンダリングの不一致を解決するため遅延インポートで本コンポーネントを読み込むこと
 * @param props
 * @returns
 */
export default function GenerationConfigView() {
  const context = useGenerationContext()

  const searchParams = useSearchParams()

  const authContext = useContext(AuthContext)

  const [showMemoSetting, setShowMemoSetting] = useState(false)

  const ref = searchParams.get("ref")

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn && ref
      ? {
          variables: {
            id: ref,
          },
        }
      : skipToken,
  )

  /**
   * URLのnanoidからタスクを復元
   */
  useEffect(() => {
    setTimeout(() => {
      try {
        if (data?.imageGenerationTask) {
          const task = data.imageGenerationTask
          context.updateModelId(task.model.id, task.model.type)
          context.updatePrompt(task.prompt)
          context.updateNegativePrompt(task.negativePrompt)
          context.updateSizeType(task.sizeType)
          context.updateScale(task.scale)
          context.updateSeed(task.seed)
          context.updateSteps(task.steps)
          context.updateSampler(task.sampler)
          context.updateClipSkip(task.clipSkip)
          context.updateVae(task.vae)

          toast("タスクを復元しました。")
        }
      } catch (error) {
        console.error(error)
      }
    }, 1000)
  }, [])

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

  return (
    <GenerationViewCard
      title={"モデル"}
      tooltip={"イラストに使用するモデルです、絵柄を変更できます。"}
    >
      <ScrollArea type="always">
        <div
          className={cn(
            "flex flex-col gap-y-4 px-4",
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
          />
          <Separator />
          <GenerationConfigLoraModels />
          <Separator />
          <GenerationConfigSize
            modelType={configModelType}
            value={context.config.sizeType}
            onChange={context.updateSizeType}
          />
          <Separator />
          <GenerationConfigI2i />
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
