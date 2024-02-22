"use client"

import { GenerationEditorConfigClipSkip } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-clipskip"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-lora-models"
import { GenerationEditorConfigModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-models"
import { GenerationEditorConfigResetButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-reset-button"
import { GenerationEditorConfigSampler } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-sampler"
import { GenerationEditorConfigScale } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-step"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"
import { AuthContext } from "@/app/_contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { config } from "@/config"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
} from "@/graphql/__generated__/graphql"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { cn } from "@/lib/utils"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useContext } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  /**
   * モデル
   */
  models: ImageModelsQuery["imageModels"]
  /**
   * Loraモデル
   */
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
}

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationEditorConfigView = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)
  const editor = useGenerationEditor()
  const searchParams = useSearchParams()
  const authContext = useContext(AuthContext)
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
          editor.updateModelId(task.model.id, task.model.type)
          editor.updatePrompt(task.prompt)
          editor.updateNegativePrompt(task.negativePrompt)
          editor.updateSizeType(task.sizeType)
          editor.updateScale(task.scale)
          editor.updateSeed(task.seed)
          editor.updateSteps(task.steps)
          editor.updateSampler(task.sampler)
          editor.updateClipSkip(task.clipSkip)

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
  const currentModel = props.models.find((model) => {
    return model.id === editor.context.modelId
  })

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
            `flex flex-col px-4 gap-y-4 pb-4 ${!isDesktop ? "max-h-96" : ""}`,
          )}
        >
          <GenerationEditorConfigModels
            models={props.models}
            currentModelId={editor.context.modelId}
            currentModelIds={editor.context.modelIds}
            onSelectModelId={editor.updateModelId}
          />
          <Separator />
          <GenerationEditorConfigLoraModels
            models={props.loraModels}
            loraModels={editor.context.loraModels}
            availableLoraModelsCount={editor.context.availableLoraModelsCount}
            onChangeLoraModel={editor.changeLoraModel}
            onUpdateLoraModel={editor.updateLoraModel}
          />
          <Separator />
          <GenerationEditorConfigSize
            modelType={configModelType}
            value={editor.context.sizeType}
            onChange={editor.updateSizeType}
          />
          <GenerationEditorConfigScale
            value={editor.context.scale}
            onChange={editor.updateScale}
          />
          <GenerationEditorConfigSeed
            value={editor.context.seed}
            onChange={editor.updateSeed}
          />
          <GenerationEditorConfigStep
            value={editor.context.steps}
            onChange={editor.updateSteps}
          />
          <GenerationEditorConfigSampler
            value={editor.context.sampler}
            onChange={editor.updateSampler}
          />
          <GenerationEditorConfigClipSkip
            value={editor.context.clipSkip}
            onChange={editor.updateClipSkip}
          />
          <div className="sticky bottom-0 pb-4 pt-4 bg-card">
            <GenerationEditorConfigResetButton onReset={editor.reset} />
          </div>
        </div>
      </ScrollArea>
    </GenerationEditorCard>
  )
}
