"use client"

import { GenerationEditorConfigClipSkip } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-clipskip"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-lora-models"
import { GenerationEditorConfigModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-models"
import { GenerationEditorConfigOpenFavoriteModelToggle } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-open-favorite-model-button"
import { GenerationEditorConfigResetButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-reset-button"
import { GenerationEditorConfigSampler } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-sampler"
import { GenerationEditorConfigScale } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-step"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AuthContext } from "@/app/_contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { userSettingQuery } from "@/graphql/queries/user/user-setting"
import { cn } from "@/lib/utils"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useContext } from "react"
import { toast } from "sonner"

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationEditorConfigView = () => {
  const context = useGenerationContext()

  const searchParams = useSearchParams()

  const authContext = useContext(AuthContext)

  const [showFavoritedModels, setShowFavoritedModels] = useState(false)

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
        console.log(data)

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
  const favoritedModel = context.models.filter((model) => {
    return context.config.favoriteModelIds.includes(Number(model.id))
  })

  /**
   * お気に入りのモデル
   */
  const { data: userSetting } = useSuspenseQuery(userSettingQuery, {})

  useEffect(() => {
    const favoritedModelIds =
      userSetting?.userSetting?.favoritedImageGenerationModelIds ?? []
    context.updateFavoriteModelIds(favoritedModelIds)
  }, [])

  /**
   * お気に入りモデル表示切替
   */
  const onToggleShowFavorite = () => {
    if (showFavoritedModels) {
      setShowFavoritedModels(false)
      return
    }
    setShowFavoritedModels(true)
  }

  /**
   * モデルの種類
   * SD1など
   */
  const configModelType = currentModel?.type ?? "SD1"

  return (
    <GenerationEditorCard
      title={"設定"}
      tooltip={"イラストの絵柄を調整することができます。"}
    >
      <ScrollArea type="always">
        <div
          className={cn(
            "flex flex-col px-4 gap-y-4",
            "max-h-[60vh] md:max-h-full",
          )}
        >
          <GenerationEditorConfigOpenFavoriteModelToggle
            isActive={showFavoritedModels}
            onToggleShowFavorite={onToggleShowFavorite}
          />
          <GenerationEditorConfigModels
            models={context.models}
            favoritedModelIds={context.config.favoriteModelIds}
            showFavoritedModels={showFavoritedModels}
            currentModelId={context.config.modelId}
            currentModelIds={context.config.modelIds}
            onSelectModelId={context.updateModelId}
          />
          <Separator />
          <GenerationEditorConfigLoraModels />
          <Separator />
          <GenerationEditorConfigSize
            modelType={configModelType}
            value={context.config.sizeType}
            onChange={context.updateSizeType}
          />
          <GenerationEditorConfigScale
            value={context.config.scale}
            onChange={context.updateScale}
          />
          <GenerationEditorConfigSeed
            value={context.config.seed}
            onChange={context.updateSeed}
          />
          <GenerationEditorConfigStep
            value={context.config.steps}
            onChange={context.updateSteps}
          />
          <GenerationEditorConfigSampler
            value={context.config.sampler}
            onChange={context.updateSampler}
          />
          <GenerationEditorConfigClipSkip
            value={context.config.clipSkip}
            onChange={context.updateClipSkip}
          />
        </div>
      </ScrollArea>
      <div className="lg:sticky bottom-0 bg-card p-4">
        <GenerationEditorConfigResetButton onReset={context.reset} />
      </div>
    </GenerationEditorCard>
  )
}
