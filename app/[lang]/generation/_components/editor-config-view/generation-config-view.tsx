"use client"

import { GenerationConfigClipSkip } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-clip-skip"
import { GenerationConfigI2i } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-i2i"
import { GenerationConfigLoraModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-lora-models"
import { GenerationConfigMemoButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-button"
import { GenerationConfigMemoSettingDialog } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-setting-dialog"
import { GenerationConfigModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-models"
import { GenerationConfigResetButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-reset-button"
import { GenerationConfigSampler } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-sampler"
import { GenerationConfigScale } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-scale"
import { GenerationConfigSeed } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-seed"
import { GenerationConfigSize } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-size"
import { GenerationConfigStep } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-step"
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
import { imageGenerationMemosQuery } from "@/graphql/queries/image-generation/image-generation-memos"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { userSettingQuery } from "@/graphql/queries/user/user-setting"
import { cn } from "@/lib/utils"
import { skipToken, useQuery, useSuspenseQuery } from "@apollo/client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useContext } from "react"
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

  const [showFavoritedModels, setShowFavoritedModels] = useState(false)

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

  const { data: memos, refetch } = useQuery(imageGenerationMemosQuery, {
    variables: {
      limit: 64,
      offset: 0,
      orderBy: {
        createdAt: "DESC",
      },
    },
  })

  return (
    <GenerationViewCard
      title={"設定"}
      tooltip={"イラストの絵柄を調整することができます。"}
    >
      <ScrollArea type="always">
        <div
          className={cn(
            "flex flex-col px-4 gap-y-4",
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
          <GenerationConfigI2i />
          <GenerationConfigSeed
            value={context.config.seed}
            onChange={context.updateSeed}
          />
          <Accordion type="single" collapsible>
            <AccordionItem value="setting">
              <AccordionTrigger>詳細設定</AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
      <div className="lg:sticky bottom-0 bg-card p-4">
        <div className="flex gap-x-2">
          <GenerationConfigMemoButton
            onClick={() => {
              setShowMemoSetting(true)
            }}
          />
          <GenerationConfigMemoSettingDialog
            memos={memos}
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
