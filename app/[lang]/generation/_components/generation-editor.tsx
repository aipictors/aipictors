"use client"

import { GenerationEditorConfig } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config"
import { GenerationCancelButton } from "@/app/[lang]/generation/_components/generation-cancel-button"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/generation/_components/generation-editor-prompt"
import { GenerationEditorResultForm } from "@/app/[lang]/generation/_components/generation-editor-result-form"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useImageGenerationMachine } from "@/app/[lang]/generation/_hooks/use-image-generation-machine"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { Button } from "@/components/ui/button"
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
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { Suspense, startTransition, useEffect, useState } from "react"
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
  const [rating, setRating] = useState(-1)
  const [beforeTaskId, setBeforeTaskId] = useState("")

  const { data: viewer, refetch: refetchViewer } = useSuspenseQuery(
    viewerCurrentPassQuery,
    {},
  )

  const { data, refetch } = useSuspenseQuery(viewerImageGenerationTasksQuery, {
    variables: { limit: 1, offset: 0 },
    errorPolicy: "all",
    context: { simulateError: true },
  })

  const onChangeRating = (rating: number) => {
    setRating(rating)
  }

  const machine = useImageGenerationMachine({
    passType: viewer.viewer?.currentPass?.type ?? null,
  })

  const [signTerms] = useMutation(signImageGenerationTermsMutation)

  const [createTask, { loading }] = useMutation(
    createImageGenerationTaskMutation,
  )

  const [cancelTask] = useMutation(cancelImageGenerationTaskMutation)

  /**
   * 生成中かどうか
   */
  const inProgress = () => {
    // 生成中タスクが存在するなら生成中とみなす
    const waitIndex = data?.viewer?.imageGenerationTasks.findIndex((task) => {
      return task.status === "IN_PROGRESS" || task.status === "PENDING"
    })
    if (waitIndex !== -1) {
      return true
    }

    // 初期値のままならまだ生成ボタンを押してないので何もしない
    if (beforeTaskId === "") {
      return false
    }

    // 生成開始前と同じ状態なら生成開始中なので、生成中とみなす
    if (
      data?.viewer?.imageGenerationTasks.length &&
      beforeTaskId === data?.viewer?.imageGenerationTasks[0]?.id
    ) {
      // 生成ボタン押した直後の通信が遅い場合もここに入る
      return true
    }

    // もし開始ボタン押下前と違うタスクが取得できていたら生成開始成功
    if (
      data?.viewer?.imageGenerationTasks.length &&
      beforeTaskId !== data?.viewer?.imageGenerationTasks[0]?.id
    ) {
      setBeforeTaskId(data?.viewer?.imageGenerationTasks[0]?.id)
      return true
    }

    return false
  }

  const isTimeout = useFocusTimeout()

  useEffect(() => {
    const time = setInterval(() => {
      if (isTimeout || !inProgress) return
      startTransition(() => {
        refetch()
      })
    }, 1000)
    // クリーンアップ関数
    return () => {
      clearInterval(time)
    }
  }, [])

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
    setBeforeTaskId("")
  }

  const initBeforeTaskId = () => {
    if (data?.viewer?.imageGenerationTasks.length) {
      setBeforeTaskId(data?.viewer?.imageGenerationTasks[0].id)
    } else {
      setBeforeTaskId("0")
    }
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
      initBeforeTaskId()
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

  const operationButton = () => {
    if (hasSignedTerms && !inProgress()) {
      return (
        <GenerationSubmitButton
          onClick={onCreateTask}
          isLoading={loading}
          isDisabled={machine.state.context.isDisabled}
        />
      )
    }
    if (hasSignedTerms && inProgress()) {
      return (
        <GenerationCancelButton
          onClick={onCancelTask}
          isLoading={loading}
          isDisabled={machine.state.context.isDisabled}
        />
      )
    }
    if (!hasSignedTerms) {
      return (
        <GenerationTermsButton
          termsMarkdownText={props.termsMarkdownText}
          onSubmit={onSignImageGenerationTerms}
        />
      )
    }
    return <></>
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
          onBlurPromptText={machine.initPromptWithLoraModel}
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
          <Card className="p-4 space-y-2">
            <div>{operationButton()}</div>
            <div className="flex">
              <p className="mr-2">
                生成枚数：{data?.viewer?.remainingImageGenerationTasksCount}/
                {maxCount()}
              </p>
              <p>
                生成待ち：
                {inProgress()
                  ? data?.imageGenerationEngineStatus.normalTasksCount
                  : "-"}
              </p>
            </div>
          </Card>
          <GenerationEditorCard
            title={"生成履歴"}
            action={
              <Button variant={"secondary"} size={"sm"}>
                {"全て見る"}
              </Button>
            }
          >
            <Suspense fallback={null}>
              <GenerationEditorResultForm
                userNanoid={viewer?.viewer?.user?.nanoid ?? null}
                rating={rating}
                onChangeRating={onChangeRating}
                onChangeSampler={machine.updateSampler}
                onChangeScale={machine.updateScale}
                onChangeSeed={machine.updateSeed}
                onChangeSize={machine.updateSizeType}
                onChangeVae={machine.updateVae}
                onChangePromptText={machine.updatePrompt}
                onChangeNegativePromptText={machine.updateNegativePrompt}
              />
            </Suspense>
          </GenerationEditorCard>
        </div>
      }
    />
  )
}
