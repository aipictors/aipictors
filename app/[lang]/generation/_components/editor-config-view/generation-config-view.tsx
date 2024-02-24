"use client"

import { GenerationConfigClipSkip } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-clip-skip"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-lora-models"
import { GenerationConfigModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-models"
import { GenerationConfigResetButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-reset-button"
import { GenerationConfigSampler } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-sampler"
import { GenerationConfigScale } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-scale"
import { GenerationConfigSeed } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-seed"
import { GenerationConfigSize } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-size"
import { GenerationConfigStep } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-step"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AuthContext } from "@/app/_contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { userSettingQuery } from "@/graphql/queries/user/user-setting"
import { cn } from "@/lib/utils"
import { useQuery } from "@apollo/client"
import { useSearchParams } from "next/navigation"
import { useContext, useEffect } from "react"
import { toast } from "sonner"

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationConfigView = () => {
  const context = useGenerationContext()

  const searchParams = useSearchParams()

  const authContext = useContext(AuthContext)

  const ref = searchParams.get("ref")

  useQuery(imageGenerationTaskQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || ref === null,
    onCompleted(data) {
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
    },
  })

  /**
   * 選択中のモデル
   */
  const currentModel = context.models.find((model) => {
    return model.id === context.config.modelId
  })

  /**
   * お気に入りのモデル
   */
  const { data: userSetting } = useQuery(userSettingQuery, {})

  useEffect(() => {
    const favoritedModelIds =
      userSetting?.userSetting?.favoritedImageGenerationModelIds ?? []
    context.updateFavoriteModelIds(favoritedModelIds)
  }, [])

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
          <GenerationConfigModels />
          <Separator />
          <GenerationEditorConfigLoraModels />
          <Separator />
          <GenerationConfigSize
            modelType={configModelType}
            value={context.config.sizeType}
            onChange={context.updateSizeType}
          />
          <GenerationConfigScale
            value={context.config.scale}
            onChange={context.updateScale}
          />
          <GenerationConfigSeed
            value={context.config.seed}
            onChange={context.updateSeed}
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
        </div>
      </ScrollArea>
      <div className="lg:sticky bottom-0 bg-card p-4">
        <GenerationConfigResetButton onReset={context.reset} />
      </div>
    </GenerationEditorCard>
  )
}
