"use client"

import { GenerationEditorProgress } from "@/app/[lang]/generation/_components/submission-view/generation-status-progress"
import { GenerationSubmitOperationParts } from "@/app/[lang]/generation/_components/submission-view/generation-submit-operation-parts"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { createRandomString } from "@/app/[lang]/generation/_utils/create-random-string"
import { uploadImage } from "@/app/_utils/upload-image"
import { AppFixedContent } from "@/components/app/app-fixed-content"
import { config } from "@/config"
import type {
  ImageGenerationSizeType,
  ImageGenerationType,
} from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskReservedMutation } from "@/graphql/mutations/create-image-generation-reserved-task"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { signImageGenerationTermsMutation } from "@/graphql/mutations/sign-image-generation-terms"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationStatusQuery } from "@/graphql/queries/viewer/viewer-image-generation-status"
import { useMutation, useQuery } from "@apollo/client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  termsText: string
}

export function GenerationSubmissionView(props: Props) {
  const context = useGenerationContext()

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const [generationCount, setGenerationCount] = useState(1)

  const [reservedGenerationCount, setReservedGenerationCount] = useState(1)

  const [beforeGenerationParams, setBeforeGenerationParams] = useState("")

  const [createTask, { loading: isCreatingTask }] = useMutation(
    createImageGenerationTaskMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
      // TODO: キャッシュの更新（不要かも）
      // update(cache, result) {
      //   const data = cache.readQuery({
      //     query: viewerImageGenerationTasksQuery,
      //     variables: { limit: 64, offset: 0, where: {} },
      //   })
      //   if (!result.data) return
      //   if (data === null || data.viewer === null) return
      //   cache.writeQuery({
      //     query: viewerImageGenerationTasksQuery,
      //     variables: { limit: 64, offset: 0, where: {} },
      //     data: {
      //       ...data,
      //       viewer: {
      //         ...data.viewer,
      //         imageGenerationTasks: [
      //           ...data.viewer.imageGenerationTasks,
      //           result.data.createImageGenerationTask,
      //         ],
      //       },
      //     },
      //   })
      // },
    },
  )

  const [createReservedTask, { loading: isCreatingReservedTask }] = useMutation(
    createImageGenerationTaskReservedMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    },
  )

  const { data: status } = useQuery(viewerImageGenerationStatusQuery, {
    pollInterval: 2000,
  })

  const [signTerms, { loading: isSigningTerms }] = useMutation(
    signImageGenerationTermsMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    },
  )

  /**
   * 規約に同意する
   */
  const onSignTerms = async () => {
    try {
      await signTerms({ variables: { input: { version: 1 } } })
      toast("画像生成の利用規約に同意しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 同じSeedでリクエストを行ったかどうか、同じならエラーを表示する
   */
  const checkSameBeforeRequestAndToast: (
    modelName: string,
    generationType: string,
    i2iFileUrl: string,
  ) => boolean = (modelName, generationType, i2iFileUrl) => {
    const generationParams = {
      model: modelName,
      vae: context.config.vae ?? "",
      prompt: context.config.promptText,
      negativePrompt: context.config.negativePromptText,
      seed: context.config.seed,
      steps: context.config.steps,
      scale: context.config.scale,
      sampler: context.config.sampler,
      clipSkip: context.config.clipSkip,
      sizeType: context.config.sizeType as ImageGenerationSizeType,
      type: generationType,
      i2iFileUrl: i2iFileUrl,
      t2tImageUrl: i2iFileUrl,
      t2tDenoisingStrengthSize:
        context.config.i2iDenoisingStrengthSize.toString(),
    }
    const generationParamsJson = JSON.stringify(generationParams)
    if (beforeGenerationParams === generationParamsJson) {
      toast(
        "前回と同じ生成条件での連続生成はできません。Seedを変更してください。",
      )
      return true
    }
    if (context.config.seed !== -1) {
      setBeforeGenerationParams(generationParamsJson)
    }
    return false
  }

  /**
   * タスクを作成ボタンを押したときのコールバック
   */
  const onCreateTask = async () => {
    /**
     * 生成種別
     */
    const generationType = context.config.i2iImageBase64
      ? "IMAGE_TO_IMAGE"
      : "TEXT_TO_IMAGE"

    if (
      generationCount > 1 &&
      context.currentPass?.type !== "STANDARD" &&
      context.currentPass?.type !== "PREMIUM"
    ) {
      toast("STANDARD以上のプランで2枚以上を同時指定可能です。")
      return
    }

    // 生成中かつスタンダード、プレミアム以外ならサブスクに誘導
    if (
      inProgressImageGenerationTasksCount !== 0 &&
      context.currentPass?.type !== "STANDARD" &&
      context.currentPass?.type !== "PREMIUM"
    ) {
      toast("STANDARD以上のプランで複数枚同時生成可能です。")
      return
    }

    // i2iの場合は連続生成数を超過していたらエラーにする
    if (
      generationType === "IMAGE_TO_IMAGE" &&
      inProgressImageGenerationTasksCount + generationCount > maxTasksCount
    ) {
      toast("同時生成枚数の上限です。")
      return
    }

    // 生成リクエストしたい回数分生成リクエストを行う
    // もし通常の連続生成を超過したら予約生成に切り替える
    try {
      const model = context.models.find((model) => {
        return model.id === context.config.modelId
      })
      if (typeof model === "undefined") return

      const userNanoid = context.user?.nanoid ?? null
      if (userNanoid === null) {
        toast("画面更新して再度お試し下さい。")
        return
      }

      if (
        checkSameBeforeRequestAndToast(model.name, generationType, "") === true
      ) {
        return
      }

      if (generationType === "IMAGE_TO_IMAGE") {
        const i2iFileName = `${createRandomString(30)}_img2img_src.png`
        const i2iFileUrl = await uploadImage(
          context.config.i2iImageBase64,
          i2iFileName,
          userNanoid,
        )
        if (i2iFileUrl === "") {
          toast("画像のアップロードに失敗しました")
          return
        }
        await createTaskCore(
          generationCount,
          model.name,
          generationType,
          i2iFileUrl,
        )
      } else {
        await createTaskCore(generationCount, model.name, generationType, "")
      }
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 生成APIを使って生成を開始する
   * @param taskCount
   * @param modelName
   * @param generationType
   * @param i2iFileUrl
   * @returns
   */
  const createTaskCore = async (
    taskCount: number,
    modelName: string,
    generationType: string,
    i2iFileUrl: string,
  ) => {
    const taskCounts = Array.from({ length: taskCount }, (_, i) => i)

    // シードを設定する、連続生成のときはSeedは連番にする
    const seeds: number[] = []

    taskCounts.map((i) => {
      if (context.config.seed === -1) {
        seeds.push(-1)
      } else {
        seeds.push(context.config.seed + i)
      }
    })

    // プロンプトが設定されていない場合はランダムなプロンプトを使用する
    const promptsTexts: string[] = []

    taskCounts.map((i) => {
      if (context.config.promptText) {
        promptsTexts.push(context.config.promptText)
      } else {
        promptsTexts.push(
          config.generationFeature.randomPrompts[
            Math.floor(
              Math.random() * config.generationFeature.randomPrompts.length,
            )
          ],
        )
      }
    })

    const nowGeneratingCount = inProgressImageGenerationTasksCount // 生成中枚数
    const promises = taskCounts.map((i) => {
      if (i2iFileUrl !== "" && i + 1 + nowGeneratingCount > maxTasksCount) {
        // i2iの場合は通常の連続生成の枚数を超過していたら何もしない
        return
      }
      if (i + 1 + nowGeneratingCount > maxTasksCount) {
        createReservedTask({
          variables: {
            input: {
              count: 1,
              model: modelName,
              vae: context.config.vae ?? "",
              prompt: context.config.promptText,
              negativePrompt: context.config.negativePromptText,
              seed: seeds[i],
              steps: context.config.steps,
              scale: context.config.scale,
              sampler: "DPM++ 2M Karras",
              clipSkip: context.config.clipSkip,
              sizeType: context.config.sizeType as ImageGenerationSizeType,
              type: "TEXT_TO_IMAGE",
            },
          },
        })
      } else {
        createTask({
          variables: {
            input: {
              count: 1,
              model: modelName,
              vae: context.config.vae ?? "",
              prompt: promptsTexts[i],
              negativePrompt: context.config.negativePromptText,
              seed: seeds[i],
              steps: context.config.steps,
              scale: context.config.scale,
              sampler: context.config.sampler,
              clipSkip: context.config.clipSkip,
              sizeType: context.config.sizeType as ImageGenerationSizeType,
              type: generationType as ImageGenerationType,
              t2tImageUrl: i2iFileUrl,
              t2tDenoisingStrengthSize:
                context.config.i2iDenoisingStrengthSize.toString(),
            },
          },
        })
      }
    })
    await Promise.all(promises)
    // タスクの作成後も呼び出す必要がある
    if (isDesktop) {
      toast("タスクを作成しました")
    } else {
      toast("タスクを作成しました", { position: "top-center" })
    }
    if (typeof context.user?.nanoid !== "string") {
      toast("画面更新して再度お試し下さい。")
      return
    }
    await activeImageGeneration({ nanoid: context.user.nanoid })
  }

  const engineStatus = status?.imageGenerationEngineStatus

  /**
   * 画像生成中
   * 生成のキャンセルが可能
   */
  const inProgress =
    status?.viewer?.inProgressImageGenerationTasksCount !== undefined &&
    status?.viewer?.inProgressImageGenerationTasksCount !== 0

  /**
   * 最大生成枚数
   */
  const availableImageGenerationMaxTasksCount =
    status?.viewer?.availableImageGenerationMaxTasksCount ?? 30

  /**
   * 生成済み枚数
   */
  const tasksCount = status?.viewer?.remainingImageGenerationTasksCount ?? 0

  /**
   * 同時生成最大枚数
   */
  const maxTasksCount =
    status?.viewer?.availableConsecutiveImageGenerationsCount ?? 0

  /**
   * 生成中の枚数
   */
  const inProgressImageGenerationTasksCount =
    status?.viewer?.inProgressImageGenerationTasksCount ?? 0

  /**
   * 予約生成中の枚数
   */
  const inProgressImageGenerationReservedTasksCount =
    status?.viewer?.inProgressImageGenerationReservedTasksCount ?? 0

  useEffect(() => {
    if (
      inProgressImageGenerationTasksCount > 0 ||
      inProgressImageGenerationReservedTasksCount > 0
    ) {
      context.updateIsCreatingTask(true)
    } else {
      context.updateIsCreatingTask(false)
    }
  }, [
    inProgressImageGenerationReservedTasksCount,
    inProgressImageGenerationTasksCount,
  ])

  /**
   * 待ち人数
   */
  const imageGenerationWaitCount = status?.viewer?.imageGenerationWaitCount ?? 0

  useEffect(() => {
    context.updateImageGenerationWaitCount(imageGenerationWaitCount)
  }, [imageGenerationWaitCount])

  return (
    <AppFixedContent position="bottom">
      <div className="space-y-2">
        <GenerationSubmitOperationParts
          isCreatingTask={isCreatingTask || isSigningTerms}
          inProgressImageGenerationTasksCount={
            inProgressImageGenerationTasksCount
          }
          inProgressImageGenerationReservedTasksCount={
            inProgressImageGenerationReservedTasksCount
          }
          maxTasksCount={maxTasksCount}
          tasksCount={tasksCount}
          termsText={props.termsText}
          availableImageGenerationMaxTasksCount={
            availableImageGenerationMaxTasksCount
          }
          generationCount={generationCount}
          setGenerationCount={setGenerationCount}
          onCreateTask={onCreateTask}
          onSignTerms={onSignTerms}
        />
        <div className="hidden 2xl:block lg:block md:block xl:block">
          <div className="flex">
            <GenerationEditorProgress
              inProgress={inProgress}
              maxTasksCount={availableImageGenerationMaxTasksCount}
              normalPredictionGenerationSeconds={
                engineStatus?.normalPredictionGenerationSeconds ?? 0
              }
              normalTasksCount={engineStatus?.normalTasksCount ?? 0}
              passType={context.currentPass?.type ?? null}
              remainingImageGenerationTasksCount={tasksCount}
              standardPredictionGenerationSeconds={
                engineStatus?.standardPredictionGenerationSeconds ?? 0
              }
              standardTasksCount={engineStatus?.standardTasksCount ?? 0}
            />
            {context.currentPass?.type !== "PREMIUM" && (
              <div className="ml-auto">
                <Link href="/plus">
                  <div className="text-sm">
                    {"高速生成、生成枚数、機能を増やす"}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppFixedContent>
  )
}