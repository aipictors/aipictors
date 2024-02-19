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

    // 生成中かつフリープランならサブスクに誘導
    if (
      status?.viewer?.inProgressImageGenerationTasksCount !== undefined &&
      status?.viewer?.inProgressImageGenerationTasksCount !== 0 &&
      !viewer.viewer?.currentPass?.type
    ) {
      toast("STANDARD以上のプランで複数枚同時生成可能です。")
      return
    }

    // 同時生成枚数を超過していたらエラー
    if (
      status?.viewer?.inProgressImageGenerationTasksCount !== undefined &&
      status?.viewer?.inProgressImageGenerationTasksCount >
        status?.viewer?.inProgressImageGenerationTasksCount + generationCount
    ) {
      toast("同時生成枚数の上限です。")
      return
    }

    try {
      await activeImageGeneration({ nanoid: userNanoid })
      const model = props.imageModels.find((model) => {
        return model.id === machine.context.modelId
      })
      if (typeof model === "undefined") return

      const taskCounts = Array.from({ length: generationCount }, (_, i) => i)
      const promises = taskCounts.map(() =>
        createTask({
          variables: {
            input: {
              count: 1,
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
        }),
      )
      await Promise.all(promises)

      toast("タスクを作成しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 最大生成枚数
   */
  const availableImageGenerationMaxTasksCount =
    status?.viewer?.availableImageGenerationMaxTasksCount ?? 30

  /**
   * 生成済み枚数
   */
  const generatedTasksCount =
    status?.viewer?.remainingImageGenerationTasksCount ?? 0

  /**
   * 同時生成最大枚数
   */
  const generatingMaxTasksCount =
    status?.viewer?.availableConsecutiveImageGenerationsCount ?? 0

  /**
   * 生成中の枚数
   */
  const inProgressImageGenerationTasksCount =
    status?.viewer?.inProgressImageGenerationTasksCount ?? 0

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
            tasksCount={generatedTasksCount}
            maxTasksCount={availableImageGenerationMaxTasksCount}
            generateTaskCount={generationCount}
            generatingMaxTaskCount={generatingMaxTasksCount}
            inProgressImageGenerationTasksCount={
              inProgressImageGenerationTasksCount
            }
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
