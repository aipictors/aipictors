"use client"

import { GenerationEditorProgress } from "@/app/[lang]/generation/_components/editor-submission-view/generation-status-progress"
import { GenerationSubmitOperationParts } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-operation-parts"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AppFixedContent } from "@/components/app/app-fixed-content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { config } from "@/config"
import { ImageGenerationSizeType } from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskReservedMutation } from "@/graphql/mutations/create-image-generation-reserved-task"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { deleteReservedImageGenerationTasksMutation } from "@/graphql/mutations/delete-image-generation-reserved-task"
import { signImageGenerationTermsMutation } from "@/graphql/mutations/sign-image-generation-terms"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationStatusQuery } from "@/graphql/queries/viewer/viewer-image-generation-status"
import { useMutation, useQuery } from "@apollo/client"
import { useState } from "react"
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

  const [generationMode, setGenerationMode] = useState("normal")

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

  const [deleteReservedTasks, { loading: isDeletingReservedTasks }] =
    useMutation(deleteReservedImageGenerationTasksMutation, {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    })

  const { data: status } = useQuery(viewerImageGenerationStatusQuery, {
    pollInterval: isCreatingTask ? 1000 : 10000,
  })

  const [signTerms] = useMutation(signImageGenerationTermsMutation, {
    refetchQueries: [viewerCurrentPassQuery],
    awaitRefetchQueries: true,
  })

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
   * 生成モード変更
   * @param mode 生成モード変更フラグ
   */
  const onChangeGenerationMode = (mode: string) => {
    if (
      context.currentPass?.type !== "STANDARD" &&
      context.currentPass?.type !== "PREMIUM"
    ) {
      toast("STANDARD、PREMIUMのプランで予約生成可能です。")
      return
    }

    setGenerationMode(mode)
  }

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    /**
     * 同時生成可能枚数
     */
    const inProgressImageGenerationTasksCount =
      status?.viewer?.inProgressImageGenerationTasksCount === undefined
        ? 1
        : status?.viewer?.inProgressImageGenerationTasksCount

    // 生成中かつフリープランならサブスクに誘導
    if (
      inProgressImageGenerationTasksCount !== 0 &&
      context.currentPass === null
    ) {
      toast("STANDARD以上のプランで複数枚同時生成可能です。")
      return
    }

    // 同時生成枚数を超過していたらエラー
    if (inProgressImageGenerationTasksCount + generationCount > maxTasksCount) {
      toast("同時生成枚数の上限です。")
      return
    }

    try {
      const model = context.models.find((model) => {
        return model.id === context.config.modelId
      })
      if (typeof model === "undefined") return
      const taskCounts = Array.from({ length: generationCount }, (_, i) => i)

      const generationParams = {
        model: model.name,
        vae: context.config.vae ?? "",
        prompt: context.config.promptText,
        negativePrompt: context.config.negativePromptText,
        seed: context.config.seed,
        steps: context.config.steps,
        scale: context.config.scale,
        sampler: context.config.sampler,
        clipSkip: context.config.clipSkip,
        sizeType: context.config.sizeType as ImageGenerationSizeType,
        type: "TEXT_TO_IMAGE",
      }
      const generationParamsJson = JSON.stringify(generationParams)
      if (beforeGenerationParams === generationParamsJson) {
        toast(
          "前回と同じ生成条件での連続生成はできません。Seedを変更してください。",
        )
        return
      }
      if (context.config.seed !== -1) {
        setBeforeGenerationParams(generationParamsJson)
      }
      const promises = taskCounts.map(() =>
        createTask({
          variables: {
            input: {
              count: 1,
              model: model.name,
              vae: context.config.vae ?? "",
              prompt: context.config.promptText,
              negativePrompt: context.config.negativePromptText,
              seed: context.config.seed,
              steps: context.config.steps,
              scale: context.config.scale,
              sampler: context.config.sampler,
              clipSkip: context.config.clipSkip,
              sizeType: context.config.sizeType as ImageGenerationSizeType,
              type: "TEXT_TO_IMAGE",
            },
          },
        }),
      )
      await Promise.all(promises)
      // タスクの作成後も呼び出す必要がある
      if (isDesktop) {
        toast("タスクを作成しました")
      } else {
        toast("タスクを作成しました", { position: "top-center" })
      }
      if (typeof context.user?.nanoid !== "string") return
      await activeImageGeneration({ nanoid: context.user.nanoid })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 予約タスクを作成する
   */
  const onCreateReservedTask = async () => {
    if (
      context.currentPass?.type !== "STANDARD" &&
      context.currentPass?.type !== "PREMIUM"
    ) {
      toast("STANDARD、PREMIUMのプランで予約生成可能です。")
      return
    }
    const userNanoid = context.user?.nanoid ?? null
    if (userNanoid === null) return

    try {
      const model = context.models.find((model) => {
        return model.id === context.config.modelId
      })
      if (typeof model === "undefined") return
      const taskCounts = Array.from(
        { length: reservedGenerationCount },
        (_, i) => i,
      )

      const seeds: number[] = []
      taskCounts.map((i) => {
        if (context.config.seed === -1) {
          seeds.push(-1)
        } else {
          seeds.push(context.config.seed + i)
        }
      })

      const promises = taskCounts.map((i) =>
        createReservedTask({
          variables: {
            input: {
              count: 1,
              model: model.name,
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
        }),
      )
      await Promise.all(promises)
      // タスクの作成後も呼び出す必要がある
      await activeImageGeneration({ nanoid: userNanoid })
      if (isDesktop) {
        toast("タスクを予約しました、自動的に生成されます")
      } else {
        toast("タスクを予約しました、自動的に生成されます", {
          position: "top-center",
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 予約タスクを一括削除する
   */
  const onDeleteReservedTasks = async () => {
    try {
      await deleteReservedTasks()
      toast("予約タスクを削除しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
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

  return (
    <AppFixedContent position="bottom">
      <div className="space-y-2">
        <Tabs
          defaultValue="normal"
          onValueChange={(value) => {
            onChangeGenerationMode(value)
          }}
        >
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="normal">通常</TabsTrigger>
              <TabsTrigger value="reserve">予約</TabsTrigger>
            </TabsList>
            <div className="ml-auto block lg:hidden xl:hidden 2xl:hidden">
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
            </div>
          </div>
          <TabsContent value="normal">
            <GenerationSubmitOperationParts
              generationMode={generationMode}
              isCreatingTask={isCreatingTask}
              inProgressImageGenerationTasksCount={
                inProgressImageGenerationTasksCount
              }
              inProgressImageGenerationReservedTasksCount={
                inProgressImageGenerationReservedTasksCount
              }
              isDeletingReservedTasks={isDeletingReservedTasks}
              maxTasksCount={maxTasksCount}
              tasksCount={tasksCount}
              termsText={props.termsText}
              availableImageGenerationMaxTasksCount={
                availableImageGenerationMaxTasksCount
              }
              generationCount={generationCount}
              reservedGenerationCount={reservedGenerationCount}
              setReservedGenerationCount={setReservedGenerationCount}
              setGenerationCount={setGenerationCount}
              onCreateReservedTask={onCreateReservedTask}
              onCreateTask={onCreateTask}
              onSignTerms={onSignTerms}
              onDeleteReservedTasks={onDeleteReservedTasks}
            />
          </TabsContent>
          <TabsContent value="reserve">
            <GenerationSubmitOperationParts
              generationMode={generationMode}
              isCreatingTask={isCreatingTask}
              inProgressImageGenerationTasksCount={
                inProgressImageGenerationTasksCount
              }
              inProgressImageGenerationReservedTasksCount={
                inProgressImageGenerationReservedTasksCount
              }
              isDeletingReservedTasks={isDeletingReservedTasks}
              maxTasksCount={maxTasksCount}
              tasksCount={tasksCount}
              termsText={props.termsText}
              availableImageGenerationMaxTasksCount={
                availableImageGenerationMaxTasksCount
              }
              generationCount={generationCount}
              reservedGenerationCount={reservedGenerationCount}
              setReservedGenerationCount={setReservedGenerationCount}
              setGenerationCount={setGenerationCount}
              onCreateReservedTask={onCreateReservedTask}
              onCreateTask={onCreateTask}
              onSignTerms={onSignTerms}
              onDeleteReservedTasks={onDeleteReservedTasks}
            />
          </TabsContent>
        </Tabs>
        <div className="hidden lg:block xl:block 2xl:block">
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
        </div>
      </div>
    </AppFixedContent>
  )
}
