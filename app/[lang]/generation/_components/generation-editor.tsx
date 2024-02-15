"use client"

import { GenerationEditorConfig } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config"
import { GenerationCancelButton } from "@/app/[lang]/generation/_components/generation-cancel-button"
import { GenerationCountSelector } from "@/app/[lang]/generation/_components/generation-count-selector"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/generation/_components/generation-editor-prompt"
import { GenerationEditorResultForm } from "@/app/[lang]/generation/_components/generation-editor-result-form"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useImageGenerationMachine } from "@/app/[lang]/generation/_hooks/use-image-generation-machine"
import { useFakeLoading } from "@/app/_hooks/use-fake-loading"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { config } from "@/config"
import {
  ImageGenerationSizeType,
  ImageGenerationTaskNode,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { signImageGenerationTermsMutation } from "@/graphql/mutations/sign-image-generation-terms"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client"
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
  const [createdTask, setCreatedTask] =
    useState<ImageGenerationTaskNode | null>(null)
  const [elapsedGenerationTime, setElapsedGenerationTime] = useState(0) // 生成経過時間
  const [generationCount, setGenerationCount] = useState(1)

  const { data: viewer, refetch: refetchViewer } = useSuspenseQuery(
    viewerCurrentPassQuery,
    {},
  )

  const { data, refetch } = useQuery(viewerImageGenerationTasksQuery, {
    variables: { limit: 0, offset: 0 },
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
  const [isFakeLoading, { startFakeLoading, stopFakeLoading }] = useFakeLoading(
    60 * 1000,
  )

  const [cancelTask] = useMutation(cancelImageGenerationTaskMutation)

  // 生成中タスクが存在するなら生成中とみなす
  const inProgress = data?.viewer?.inProgressImageGenerationTasksCount !== 0

  const isTimeout = useFocusTimeout()

  useEffect(() => {
    stopFakeLoading()
    const time = setInterval(() => {
      if (isTimeout || !inProgress) {
        setElapsedGenerationTime(0)
        return
      }
      if (inProgress) {
        setElapsedGenerationTime((prev) => prev + 1)
      } else {
        setElapsedGenerationTime(0)
      }
      startTransition(() => {
        refetch()
      })
    }, 1000)
    return () => {
      clearInterval(time)
    }
  }, [inProgress])

  const onSignImageGenerationTerms = async () => {
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

  const isPriorityAccount = () => {
    if (
      viewer.viewer?.currentPass?.type === "STANDARD" ||
      viewer.viewer?.currentPass?.type === "PREMIUM"
    ) {
      return true
    }
    return false
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

      // 通信前にローディング開始しておく
      startFakeLoading()

      const newTask = await createTask({
        variables: {
          input: {
            count: generationCount,
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
      if (newTask?.data) {
        setCreatedTask(newTask.data.createImageGenerationTask)
      }

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

  const generateSpeed = (waitTasks: number | undefined) => {
    if (waitTasks === undefined) return -1
    if (waitTasks < 5) {
      return 0
    }
    if (waitTasks < 10) {
      return 1
    }
    return 2
  }

  const speed = !inProgress
    ? -1
    : generateSpeed(data?.imageGenerationEngineStatus?.normalTasksCount)

  const prioritySpeed = !inProgress
    ? -1
    : generateSpeed(data?.imageGenerationEngineStatus?.standardTasksCount)

  const generateStatus = (speed: number) => {
    if (speed === -1) {
      return "-"
    }
    if (speed === 0) {
      return "快適"
    }
    if (speed === 1) {
      return "通常"
    }
    return "混雑"
  }

  /**
   * 生成完了までの進捗（パーセンテージ）
   */
  const generationProgress = () => {
    if (!data?.imageGenerationEngineStatus || elapsedGenerationTime === 0)
      return 0
    const waitSeconds = isPriorityAccount()
      ? data?.imageGenerationEngineStatus?.standardPredictionGenerationSeconds
      : data?.imageGenerationEngineStatus?.normalPredictionGenerationSeconds
    if (!waitSeconds) return 0 // 0徐算防止
    const progressPercentage = (elapsedGenerationTime / waitSeconds) * 100
    return progressPercentage
  }

  /**
   * 残り秒数（s/m/h単位)
   */
  const secondsRemaining = () => {
    if (!data?.imageGenerationEngineStatus || elapsedGenerationTime === 0)
      return 0
    const waitSeconds = isPriorityAccount()
      ? data?.imageGenerationEngineStatus?.standardPredictionGenerationSeconds
      : data?.imageGenerationEngineStatus?.normalPredictionGenerationSeconds
    if (!waitSeconds) return 0
    const remainingSeconds = waitSeconds - elapsedGenerationTime
    if (remainingSeconds < 0) {
      return "まもなく"
    }
    return formatTime(remainingSeconds)
  }

  /**
   * 時間フォーマットに変換
   */
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s` // 秒
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m` // 分
    return `${Math.floor(seconds / 3600)}h` // 時間
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
          <div>
            {/* 生成開始ボタン */}
            {hasSignedTerms && !inProgress && (
              <>
                <div className="flex items-center">
                  <GenerationCountSelector
                    pass={
                      viewer.viewer?.currentPass?.type
                        ? viewer.viewer?.currentPass?.type
                        : "free"
                    }
                    selectedCount={generationCount}
                    onChange={(count: string) =>
                      setGenerationCount(count === "" ? 1 : parseInt(count))
                    }
                  />
                  <GenerationSubmitButton
                    onClick={onCreateTask}
                    isLoading={loading || isFakeLoading}
                    isDisabled={machine.state.context.isDisabled}
                  />
                </div>
              </>
            )}
            {/* キャンセル開始ボタン */}
            {hasSignedTerms && inProgress && (
              <div className="flex items-center">
                <GenerationCountSelector
                  pass={
                    viewer.viewer?.currentPass?.type
                      ? viewer.viewer?.currentPass?.type
                      : "free"
                  }
                  selectedCount={generationCount}
                  onChange={(count: string) =>
                    setGenerationCount(count === "" ? 1 : parseInt(count))
                  }
                />
                <GenerationCancelButton
                  onClick={onCancelTask}
                  isLoading={loading}
                  isDisabled={machine.state.context.isDisabled}
                />
              </div>
            )}
            {/* 規約確認開始ボタン */}
            {!hasSignedTerms && (
              <GenerationTermsButton
                termsMarkdownText={props.termsMarkdownText}
                onSubmit={onSignImageGenerationTerms}
              />
            )}
          </div>
          {/* 生成予想進捗 */}
          <Progress className="w-full" value={generationProgress()} />
          {/* 生成状況 */}
          <div className="flex">
            <Badge className="mr-2" variant={"secondary"}>
              {"生成枚数 "} {data?.viewer?.remainingImageGenerationTasksCount}/
              {maxCount()}
            </Badge>
            {isPriorityAccount() ? (
              <Badge className="mr-2" variant={"secondary"}>
                {"優先状態 "}
                {generateStatus(prioritySpeed)}
              </Badge>
            ) : (
              <></>
            )}
            <Badge
              variant={"secondary"}
              className={`mr-2 ${isPriorityAccount() ? "opacity-50" : ""}`}
            >
              {isPriorityAccount() ? "一般状態" : "状態"}{" "}
              {generateStatus(speed)}
            </Badge>
            <Badge variant={"secondary"} className={"mr-2"}>
              {"予測"} {inProgress ? secondsRemaining() : "-"}
            </Badge>
          </div>
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
                additionalTask={createdTask}
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
