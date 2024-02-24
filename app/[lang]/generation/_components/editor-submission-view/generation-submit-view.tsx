"use client"

import { GenerationCountSelect } from "@/app/[lang]/generation/_components/editor-submission-view/generation-count-select"
import { GenerationReserveCountInput } from "@/app/[lang]/generation/_components/editor-submission-view/generation-reserve-count-input"
import { GenerationScheduleCheckbox } from "@/app/[lang]/generation/_components/editor-submission-view/generation-schedule-checkbox"
import { GenerationEditorProgress } from "@/app/[lang]/generation/_components/editor-submission-view/generation-status-progress"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTasksCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-tasks-cancel-button"
import { AppFixedContent } from "@/components/app/app-fixed-content"
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

  const [tasksCount, setTasksCount] = useState(1)

  const [scheduledTasksCount, setScheduledTasksCount] = useState(1)

  const [lastTaskParamsText, setLastTaskParamsText] = useState("")

  const [isScheduleMode, setScheduleMode] = useState(false)

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

  const [createScheduledTask] = useMutation(
    createImageGenerationTaskReservedMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    },
  )

  const [deleteScheduledTasks, { loading: isDeletingReservedTasks }] =
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
  const onChangeGenerationMode = (mode: boolean) => {
    if (
      context.currentPass?.type !== "STANDARD" &&
      context.currentPass?.type !== "PREMIUM"
    ) {
      toast("STANDARD、PREMIUMのプランで予約生成可能です。")
      return
    }
    setScheduleMode(mode)
  }

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    /**
     * 同時生成可能枚数
     */
    const runningTasksCount =
      status?.viewer?.inProgressImageGenerationTasksCount === undefined
        ? 1
        : status?.viewer?.inProgressImageGenerationTasksCount
    // 生成中かつフリープランならサブスクに誘導
    if (runningTasksCount !== 0 && context.currentPass === null) {
      toast("STANDARD以上のプランで複数枚同時生成可能です。")
      return
    }
    // 同時生成枚数を超過していたらエラー
    if (runningTasksCount + tasksCount > maxTasksCount) {
      toast("同時生成枚数の上限です。")
      return
    }
    try {
      const model = context.models.find((model) => {
        return model.id === context.config.modelId
      })
      if (typeof model === "undefined") return
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
      const paramsText = JSON.stringify(generationParams)
      if (lastTaskParamsText === paramsText) {
        toast(
          "前回と同じ生成条件での連続生成はできません。Seedを変更してください。",
        )
        return
      }
      if (context.config.seed !== -1) {
        setLastTaskParamsText(paramsText)
      }
      const taskIndexes = Array.from({ length: tasksCount }, (_, i) => i)
      const promises = taskIndexes.map(() => {
        return createTask({
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
        })
      })
      await Promise.all(promises)
      // タスクの作成後も呼び出す必要がある
      toast("タスクを作成しました", {
        position: isDesktop ? undefined : "top-center",
      })
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
  const onScheduleTask = async () => {
    if (
      context.currentPass?.type !== "STANDARD" &&
      context.currentPass?.type !== "PREMIUM"
    ) {
      toast("STANDARD、PREMIUMのプランで予約生成可能です。")
      return
    }
    try {
      const model = context.models.find((model) => {
        return model.id === context.config.modelId
      })
      if (typeof model === "undefined") return
      const taskIndexes = Array.from(
        { length: scheduledTasksCount },
        (_, i) => i,
      )
      const seeds = taskIndexes.map((i) => {
        return context.config.seed === -1 ? -1 : context.config.seed + i
      })
      const promises = taskIndexes.map((i) => {
        return createScheduledTask({
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
        })
      })
      await Promise.all(promises)
      toast("タスクを予約しました、自動的に生成されます", {
        position: isDesktop ? undefined : "top-center",
      })
      const userNanoid = context.user?.nanoid ?? null
      if (userNanoid === null) return
      // タスクの作成後も呼び出す必要がある
      await activeImageGeneration({ nanoid: userNanoid })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 予約タスクを一括削除する
   */
  const onDeleteScheduledTasks = async () => {
    try {
      await deleteScheduledTasks()
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
   * 残り生成枚数
   */
  const remainingTasksCount =
    status?.viewer?.remainingImageGenerationTasksCount ?? 0

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
        <div className="flex items-center gap-x-2">
          <GenerationScheduleCheckbox
            value={isScheduleMode}
            onChange={onChangeGenerationMode}
          />
          {!isScheduleMode && (
            <GenerationCountSelect
              pass={context.currentPass?.type ?? "FREE"}
              selectedCount={tasksCount}
              onChange={setTasksCount}
            />
          )}
          {isScheduleMode && (
            <GenerationReserveCountInput
              maxCount={
                availableImageGenerationMaxTasksCount - remainingTasksCount
              }
              onChange={setScheduledTasksCount}
              count={scheduledTasksCount}
            />
          )}
          {/* 生成開始ボタン */}
          {context.user?.hasSignedImageGenerationTerms === true && (
            <GenerationSubmitButton
              onClick={isScheduleMode ? onScheduleTask : onCreateTask}
              isLoading={isCreatingTask}
              isDisabled={context.config.isDisabled}
              isScheduleMode={isScheduleMode}
              generatingCount={
                isScheduleMode
                  ? inProgressImageGenerationReservedTasksCount
                  : inProgressImageGenerationTasksCount
              }
              maxGeneratingCount={
                isScheduleMode
                  ? availableImageGenerationMaxTasksCount - remainingTasksCount
                  : maxTasksCount
              }
            />
          )}
          {/* 規約確認開始ボタン */}
          {context.user?.hasSignedImageGenerationTerms !== true && (
            <GenerationTermsButton
              termsMarkdownText={props.termsText}
              onSubmit={onSignTerms}
            />
          )}
          {/* 生成キャンセル */}
          {isScheduleMode && (
            <GenerationTasksCancelButton
              isDisabled={
                inProgressImageGenerationReservedTasksCount === 0 ||
                isDeletingReservedTasks
              }
              onCancel={onDeleteScheduledTasks}
            />
          )}
        </div>
        <GenerationEditorProgress
          inProgress={inProgress}
          maxTasksCount={availableImageGenerationMaxTasksCount}
          normalPredictionGenerationSeconds={
            engineStatus?.normalPredictionGenerationSeconds ?? 0
          }
          normalTasksCount={engineStatus?.normalTasksCount ?? 0}
          passType={context.currentPass?.type ?? null}
          remainingImageGenerationTasksCount={remainingTasksCount}
          standardPredictionGenerationSeconds={
            engineStatus?.standardPredictionGenerationSeconds ?? 0
          }
          standardTasksCount={engineStatus?.standardTasksCount ?? 0}
        />
      </div>
    </AppFixedContent>
  )
}
