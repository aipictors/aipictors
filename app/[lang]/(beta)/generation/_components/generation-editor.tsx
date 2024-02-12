"use client"

import { GenerationEditorConfig } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config"
import { GenerationEditorLayout } from "@/app/[lang]/(beta)/generation/_components/generation-editor-layout"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-prompt"
import { GenerationEditorResult } from "@/app/[lang]/(beta)/generation/_components/generation-editor-result"
import { GenerationSubmitButton } from "@/app/[lang]/(beta)/generation/_components/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/(beta)/generation/_components/generation-terms-button"
import { activeImageGeneration } from "@/app/[lang]/(beta)/generation/_functions/active-image-generation"
import { useImageGenerationMachine } from "@/app/[lang]/(beta)/generation/_hooks/use-image-generation-machine"
import { Card } from "@/components/ui/card"
import { config } from "@/config"
import {
  ImageGenerationSizeType,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { signImageGenerationTermsMutation } from "@/graphql/mutations/sign-image-generation-terms"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/image-generation/image-generation-tasks"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { Suspense, startTransition, useEffect, useMemo } from "react"
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
  const { data: viewer, refetch: refetchViewer } = useSuspenseQuery(
    viewerCurrentPassQuery,
    {},
  )

  const { data, refetch } = useSuspenseQuery(viewerImageGenerationTasksQuery, {
    variables: { limit: 64, offset: 0 },
    errorPolicy: "all",
    context: { simulateError: true },
  })

  const machine = useImageGenerationMachine({
    passType: viewer.viewer?.currentPass?.type ?? null,
  })

  const [signTerms] = useMutation(signImageGenerationTermsMutation)

  const [createTask, { loading }] = useMutation(
    createImageGenerationTaskMutation,
  )

  const [cancelTask] = useMutation(cancelImageGenerationTaskMutation)

  useEffect(() => {
    const time = setInterval(() => {
      if (!document.hasFocus()) return
      startTransition(() => {
        refetch()
      })
    }, 4000)
    return () => {
      clearInterval(time)
    }
  }, [])

  const inProgress = useMemo(() => {
    const index = data?.viewer?.imageGenerationTasks.findIndex((task) => {
      return task.status === "IN_PROGRESS"
    })
    return index !== -1
  }, [data?.viewer?.imageGenerationTasks])

  const onSignImageGenerationTerms = async () => {
    console.log("onSignImageGenerationTerms")
    try {
      await signTerms({ variables: { input: { version: 1 } } })
      startTransition(() => {
        refetchViewer()
      })
      toast("画像生成の利用規約に同意しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const hasSignedTerms = viewer.viewer?.user.hasSignedImageGenerationTerms

  const maxCount = () => {
    if (viewer.viewer?.currentPass?.type === "LITE") {
      return config.passFeature.imageGenerationsCount.lite
    }
    if (viewer.viewer?.currentPass?.type === "PREMIUM") {
      return config.passFeature.imageGenerationsCount.premium
    }
    if (viewer.viewer?.currentPass?.type === "STANDARD") {
      return config.passFeature.imageGenerationsCount.standard
    }
    return config.passFeature.imageGenerationsCount.free
  }

  /**
   * タスクをキャンセルする
   */
  const onCancelTask = async () => {
    const userNanoid = viewer.viewer?.user.nanoid ?? null
    if (userNanoid === null) return
    try {
      await cancelTask()
    } catch (error) {
      toast(
        "現在リクエストを受け付けて生成実行中です、1分以上時間をおいて生成を待つか、キャンセル下さい",
      )
      return
    }
    startTransition(() => {
      refetch()
    })
    toast("タスクをキャンセルしました")
  }

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
        return model.id === machine.state.context.modelId
      })
      if (typeof model === "undefined") return
      await createTask({
        variables: {
          input: {
            count: 1,
            model: model.name,
            vae: machine.state.context.vae ?? "",
            prompt: machine.state.context.promptText,
            negativePrompt: machine.state.context.negativePromptText,
            seed: machine.state.context.seed,
            steps: machine.state.context.steps,
            scale: machine.state.context.scale,
            sampler: machine.state.context.sampler,
            sizeType: machine.state.context.sizeType as ImageGenerationSizeType,
            type: "TEXT_TO_IMAGE",
          },
        },
      })
      startTransition(() => {
        refetch()
      })
      toast("タスクを作成しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const currentModel = props.imageModels.find((model) => {
    return model.id === machine.state.context.modelId
  })

  const waitTasksCount = () => {
    return 10
  }

  return (
    <GenerationEditorLayout
      config={
        <GenerationEditorConfig
          models={props.imageModels}
          currentModelId={machine.state.context.modelId}
          currentModelIds={machine.state.context.modelIds}
          onSelectModelId={machine.updateModelId}
          loraModels={props.imageLoraModels}
          configLoRAModels={machine.state.context.loraModels}
          configModelType={currentModel?.type ?? "SD1"}
          configSampler={machine.state.context.sampler}
          configScale={machine.state.context.scale}
          configSeed={machine.state.context.seed}
          configSize={machine.state.context.sizeType}
          configVae={machine.state.context.vae}
          configSteps={machine.state.context.steps}
          availableLoraModelsCount={
            machine.state.context.availableLoraModelsCount
          }
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
          promptText={machine.state.context.promptText}
          promptCategories={props.promptCategories}
          onChangePromptText={machine.updatePrompt}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePrompt
          promptText={machine.state.context.negativePromptText}
          onChangePromptText={machine.updateNegativePrompt}
        />
      }
      history={
        <div className="flex flex-col h-full gap-y-2">
          <Card className="px-2 py-2">
            <div>
              {hasSignedTerms && (
                <GenerationSubmitButton
                  onClick={inProgress || loading ? onCancelTask : onCreateTask}
                  inProgress={inProgress}
                  isLoading={loading}
                  isDisabled={machine.state.context.isDisabled}
                />
              )}
              {!hasSignedTerms && (
                <GenerationTermsButton
                  termsMarkdownText={props.termsMarkdownText}
                  onSubmit={onSignImageGenerationTerms}
                />
              )}
            </div>
            <p className="">
              生成待ち人数：
              {inProgress
                ? data?.imageGenerationEngineStatus.normalTasksCount
                : "-"}
            </p>
            <p>
              残り生成枚数：{data?.viewer?.remainingImageGenerationTasksCount}/
              {maxCount()}
            </p>
          </Card>
          <Suspense fallback={null}>
            <GenerationEditorResult
              tasks={data?.viewer?.imageGenerationTasks ?? []}
              userNanoid={viewer?.viewer?.user?.nanoid ?? null}
              onChangeSampler={machine.updateSampler}
              onChangeScale={machine.updateScale}
              onChangeSeed={machine.updateSeed}
              onChangeSize={machine.updateSizeType}
              onChangeVae={machine.updateVae}
              onChangePromptText={machine.updatePrompt}
              onChangeNegativePromptText={machine.updateNegativePrompt}
            />
          </Suspense>
        </div>
      }
    />
  )
}
