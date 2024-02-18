"use client"

import { GenerationEditorConfig } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/generation/_components/generation-editor-prompt"
import { GenerationEditorResultForm } from "@/app/[lang]/generation/_components/generation-editor-result-form"
import { GenerationEditorStatus } from "@/app/[lang]/generation/_components/generation-editor-status"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useImageGenerationMachine } from "@/app/[lang]/generation/_hooks/use-image-generation-machine"
import {
  ImageGenerationSizeType,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationStatusQuery } from "@/graphql/queries/viewer/viewer-image-generation-status"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  termsMarkdownText: string
}

/**
 * @param props
 */
export function GenerationEditor(props: Props) {
  const { data: viewer } = useSuspenseQuery(viewerCurrentPassQuery, {})

  const { data: status } = useQuery(viewerImageGenerationStatusQuery, {
    pollInterval: 1000,
  })

  const [generationCount, setGenerationCount] = useState(1)

  const machine = useImageGenerationMachine({
    passType: viewer.viewer?.currentPass?.type ?? null,
  })

  const [createTask, { loading: isCreatingTasks }] = useMutation(
    createImageGenerationTaskMutation,
    {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    },
  )

  /**
   * 画像生成中
   * 生成のキャンセルが可能
   */
  const inProgress =
    status?.viewer?.inProgressImageGenerationTasksCount !== undefined &&
    status?.viewer?.inProgressImageGenerationTasksCount !== 0

  const hasSignedTerms =
    viewer.viewer?.user.hasSignedImageGenerationTerms ?? false

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    if (!hasSignedTerms) return
    const userNanoid = viewer.viewer?.user.nanoid ?? null
    if (userNanoid === null) return
    try {
      await activeImageGeneration({ nanoid: userNanoid })
      const model = props.imageModels.find((model) => {
        return model.id === machine.context.modelId
      })
      if (typeof model === "undefined") return
      await createTask({
        variables: {
          input: {
            count: generationCount,
            model: model.name,
            vae: machine.context.vae ?? "",
            prompt: machine.context.promptText,
            negativePrompt: machine.context.negativePromptText,
            seed: machine.context.seed,
            steps: machine.context.steps,
            scale: machine.context.scale,
            sampler: machine.context.sampler,
            sizeType: machine.context.sizeType as ImageGenerationSizeType,
            type: "TEXT_TO_IMAGE",
          },
        },
      })
      toast("タスクを作成しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <GenerationEditorLayout
      config={
        <GenerationEditorConfig
          models={props.imageModels}
          currentModelId={machine.context.modelId}
          currentModelIds={machine.context.modelIds}
          onSelectModelId={machine.updateModelId}
          loraModels={props.imageLoraModels}
          configLoRAModels={machine.context.loraModels}
          configSampler={machine.context.sampler}
          configScale={machine.context.scale}
          configSeed={machine.context.seed}
          configSize={machine.context.sizeType}
          configVae={machine.context.vae}
          configSteps={machine.context.steps}
          availableLoraModelsCount={machine.context.availableLoraModelsCount}
          onChangeLoraModelConfigs={machine.changeLoraModel}
          onChangeSampler={machine.updateSampler}
          onChangeScale={machine.updateScale}
          onChangeSeed={machine.updateSeed}
          onChangeSize={machine.updateSizeType}
          onChangeVae={machine.updateVae}
          onChangeSteps={machine.updateSteps}
          onUpdateLoraModelConfig={machine.updateLoraModel}
        />
      }
      promptEditor={
        <GenerationEditorPrompt
          promptText={machine.context.promptText}
          promptCategories={props.promptCategories}
          onChangePromptText={machine.updatePrompt}
          onBlurPromptText={machine.initPromptWithLoraModel}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePrompt
          promptText={machine.context.negativePromptText}
          onChangePromptText={machine.updateNegativePrompt}
        />
      }
      history={
        <div className="flex flex-col h-full gap-y-2">
          <GenerationEditorStatus
            normalPredictionGenerationSeconds={
              status?.imageGenerationEngineStatus
                .normalPredictionGenerationSeconds ?? null
            }
            normalTasksCount={
              status?.imageGenerationEngineStatus.normalTasksCount ?? null
            }
            standardPredictionGenerationSeconds={
              status?.imageGenerationEngineStatus
                .standardPredictionGenerationSeconds ?? null
            }
            standardTasksCount={
              status?.imageGenerationEngineStatus.standardTasksCount ?? null
            }
            hasSignedTerms={hasSignedTerms}
            termsMarkdownText={props.termsMarkdownText}
            isCreatingTasks={isCreatingTasks}
            isDisabled={machine.context.isDisabled}
            userNanoid={viewer?.viewer?.user?.nanoid ?? null}
            inProgress={inProgress}
            passType={viewer.viewer?.currentPass?.type ?? null}
            tasksCount={generationCount}
            onChangeTasksCount={setGenerationCount}
            onCreateTask={onCreateTask}
          />
          <GenerationEditorCard title={"生成履歴"}>
            <GenerationEditorResultForm
              isCreatingTasks={isCreatingTasks}
              userNanoid={viewer?.viewer?.user?.nanoid ?? null}
              onUpdateSettings={machine.updateSettings}
            />
          </GenerationEditorCard>
        </div>
      }
    />
  )
}
