"use client"

import { GenerationEditorConfigView } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-view"
import { GenerationEditorNegativePromptView } from "@/app/[lang]/generation/_components/editor-negative-prompt-view/generation-editor-negative-prompt-view"
import { GenerationEditorPromptView } from "@/app/[lang]/generation/_components/editor-prompt-view/generation-editor-prompt-view"
import { GenerationEditorSubmissionView } from "@/app/[lang]/generation/_components/editor-submission-view/generation-editor-submit-view"
import { GenerationEditorTaskListView } from "@/app/[lang]/generation/_components/editor-task-list-view-view/generation-editor-task-list-view"
import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
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

  const [isFirstInitRequested, setIsFirstInitRequested] = useState(false)

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

  const [clickGenerationSubmitCount, setClickGenerationSubmitCount] =
    useState(0)

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
   * www4へリクエストしておく
   */
  const userNanoid = viewer.viewer?.user.nanoid ?? null
  if (userNanoid !== null && !isFirstInitRequested) {
    activeImageGeneration({ nanoid: userNanoid })
    setIsFirstInitRequested(true)
  }

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    if (!hasSignedTerms) return
    const userNanoid = viewer.viewer?.user.nanoid ?? null
    if (userNanoid === null) return

    /**
     * 同時生成可能枚数
     */
    const inProgressImageGenerationTasksCount =
      status?.viewer?.inProgressImageGenerationTasksCount === undefined
        ? 1
        : status?.viewer?.inProgressImageGenerationTasksCount

    if (clickGenerationSubmitCount >= generatingMaxTasksCount) {
      toast("同時に生成できる枚数の上限です。")
      return
    }

    // 生成中かつフリープランならサブスクに誘導
    if (
      inProgressImageGenerationTasksCount !== 0 &&
      !viewer.viewer?.currentPass?.type
    ) {
      toast("STANDARD以上のプランで複数枚同時生成可能です。")
      return
    }

    // 同時生成枚数を超過していたらエラー
    if (
      inProgressImageGenerationTasksCount + generationCount >
      generatingMaxTasksCount
    ) {
      toast("同時生成枚数の上限です。")
      return
    }

    try {
      const model = props.imageModels.find((model) => {
        return model.id === machine.context.modelId
      })
      if (typeof model === "undefined") return

      setClickGenerationSubmitCount((count) => count + 1)

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
      await activeImageGeneration({ nanoid: userNanoid })

      setClickGenerationSubmitCount((count) => count - 1)

      toast("タスクを作成しました")
    } catch (error) {
      setClickGenerationSubmitCount((count) => count - 1)
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
  const inProgressImageGenerationTasksCount = Math.max(
    status?.viewer?.inProgressImageGenerationTasksCount ?? 0,
    clickGenerationSubmitCount,
  )

  return (
    <GenerationEditorLayout
      config={
        <GenerationEditorConfigView
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
        <GenerationEditorPromptView
          promptText={machine.context.promptText}
          promptCategories={props.promptCategories}
          onChangePromptText={machine.updatePrompt}
          onBlurPromptText={machine.initPromptWithLoraModel}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePromptView
          promptText={machine.context.negativePromptText}
          onChangePromptText={machine.updateNegativePrompt}
        />
      }
      history={
        <div className="flex flex-col h-full gap-y-2">
          <GenerationEditorSubmissionView
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
          <GenerationEditorTaskListView
            isCreatingTasks={isCreatingTasks}
            passType={viewer.viewer?.currentPass?.type ?? null}
            userNanoid={viewer?.viewer?.user?.nanoid ?? null}
            onUpdateSettings={machine.updateSettings}
            onCancel={() => {
              setClickGenerationSubmitCount((count) => count - 1)
            }}
          />
        </div>
      }
    />
  )
}
