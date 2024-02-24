"use client"

import { GenerationCountSelect } from "@/app/[lang]/generation/_components/editor-submission-view/generation-count-select"
import { GenerationReserveCountInput } from "@/app/[lang]/generation/_components/editor-submission-view/generation-reserve-count-input"
import { GenerationEditorProgress } from "@/app/[lang]/generation/_components/editor-submission-view/generation-status-progress"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"
import { GenerationTasksCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-tasks-cancel-button"
import { AppFixedContent } from "@/components/app/app-fixed-content"
import { Checkbox } from "@/components/ui/checkbox"
import { config } from "@/config"
import {
  ImageGenerationSizeType,
  ImageModelsQuery,
} from "@/graphql/__generated__/graphql"
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
  imageModels: ImageModelsQuery["imageModels"]
  termsMarkdownText: string
}

export function GenerationEditorSubmissionView(props: Props) {
  const editor = useGenerationEditor()

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
  const onChangeGenerationMode = (mode: boolean) => {
    if (
      editor.context.passType !== "STANDARD" &&
      editor.context.passType !== "PREMIUM"
    ) {
      toast("STANDARD、PREMIUMのプランで予約生成可能です。")
      return
    }

    setGenerationMode(mode ? "reserve" : "normal")
  }

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    if (!editor.context.hasSignedTerms) return
    const userNanoid = editor.context.userNanoId ?? null
    if (userNanoid === null) return

    /**
     * 同時生成可能枚数
     */
    const inProgressImageGenerationTasksCount =
      status?.viewer?.inProgressImageGenerationTasksCount === undefined
        ? 1
        : status?.viewer?.inProgressImageGenerationTasksCount

    // 生成中かつフリープランならサブスクに誘導
    if (inProgressImageGenerationTasksCount !== 0 && !editor.context.passType) {
      toast("STANDARD以上のプランで複数枚同時生成可能です。")
      return
    }

    // 同時生成枚数を超過していたらエラー
    if (inProgressImageGenerationTasksCount + generationCount > maxTasksCount) {
      toast("同時生成枚数の上限です。")
      return
    }

    try {
      const model = props.imageModels.find((model) => {
        return model.id === editor.context.modelId
      })
      if (typeof model === "undefined") return
      const taskCounts = Array.from({ length: generationCount }, (_, i) => i)

      const generationParams = {
        model: model.name,
        vae: editor.context.vae ?? "",
        prompt: editor.context.promptText,
        negativePrompt: editor.context.negativePromptText,
        seed: editor.context.seed,
        steps: editor.context.steps,
        scale: editor.context.scale,
        sampler: editor.context.sampler,
        clipSkip: editor.context.clipSkip,
        sizeType: editor.context.sizeType as ImageGenerationSizeType,
        type: "TEXT_TO_IMAGE",
      }
      const generationParamsJson = JSON.stringify(generationParams)
      if (beforeGenerationParams === generationParamsJson) {
        toast(
          "前回と同じ生成条件での連続生成はできません。Seedを変更してください。",
        )
        return
      }
      if (editor.context.seed !== -1) {
        setBeforeGenerationParams(generationParamsJson)
      }
      const promises = taskCounts.map(() =>
        createTask({
          variables: {
            input: {
              count: 1,
              model: model.name,
              vae: editor.context.vae ?? "",
              prompt: editor.context.promptText,
              negativePrompt: editor.context.negativePromptText,
              seed: editor.context.seed,
              steps: editor.context.steps,
              scale: editor.context.scale,
              sampler: editor.context.sampler,
              clipSkip: editor.context.clipSkip,
              sizeType: editor.context.sizeType as ImageGenerationSizeType,
              type: "TEXT_TO_IMAGE",
            },
          },
        }),
      )
      await Promise.all(promises)
      // タスクの作成後も呼び出す必要がある
      await activeImageGeneration({ nanoid: userNanoid })
      if (isDesktop) {
        toast("タスクを作成しました")
      } else {
        toast("タスクを作成しました", { position: "top-center" })
      }
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
      editor.context.passType !== "STANDARD" &&
      editor.context.passType !== "PREMIUM"
    ) {
      toast("STANDARD、PREMIUMのプランで予約生成可能です。")
      return
    }

    if (!editor.context.hasSignedTerms) return
    const userNanoid = editor.context.userNanoId ?? null
    if (userNanoid === null) return

    try {
      const model = props.imageModels.find((model) => {
        return model.id === editor.context.modelId
      })
      if (typeof model === "undefined") return
      const taskCounts = Array.from(
        { length: reservedGenerationCount },
        (_, i) => i,
      )

      const seeds: number[] = []
      taskCounts.map((i) => {
        if (editor.context.seed === -1) {
          seeds.push(-1)
        } else {
          seeds.push(editor.context.seed + i)
        }
      })

      const promises = taskCounts.map((i) =>
        createReservedTask({
          variables: {
            input: {
              count: 1,
              model: model.name,
              vae: editor.context.vae ?? "",
              prompt: editor.context.promptText,
              negativePrompt: editor.context.negativePromptText,
              seed: seeds[i],
              steps: editor.context.steps,
              scale: editor.context.scale,
              sampler: "DPM++ 2M Karras",
              clipSkip: editor.context.clipSkip,
              sizeType: editor.context.sizeType as ImageGenerationSizeType,
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
        <div className="flex items-center">
          <div className="flex items-center w-20 space-x-2">
            <>
              <Checkbox
                id="generation-mode-checkbox"
                onCheckedChange={onChangeGenerationMode}
              />
              <label
                htmlFor="generation-mode-checkbox"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-16"
              >
                予約
              </label>
            </>
          </div>
          {generationMode === "normal" && (
            <GenerationCountSelect
              pass={editor.context.passType ?? "FREE"}
              selectedCount={generationCount}
              onChange={setGenerationCount}
            />
          )}
          {generationMode === "reserve" && (
            <GenerationReserveCountInput
              maxCount={availableImageGenerationMaxTasksCount - tasksCount}
              onChange={setReservedGenerationCount}
              count={reservedGenerationCount}
            />
          )}
          {/* 生成開始ボタン */}
          {editor.context.hasSignedTerms && (
            <GenerationSubmitButton
              onClick={async () => {
                if (generationMode === "reserve") {
                  await onCreateReservedTask()
                } else {
                  await onCreateTask()
                }
              }}
              isLoading={isCreatingTask}
              isDisabled={editor.context.isDisabled}
              generatingCount={
                generationMode === "normal"
                  ? inProgressImageGenerationTasksCount
                  : inProgressImageGenerationReservedTasksCount
              }
              maxGeneratingCount={
                generationMode === "reserve"
                  ? availableImageGenerationMaxTasksCount - tasksCount
                  : maxTasksCount
              }
              buttonActionCaption={
                generationMode === "reserve" ? "予約生成" : "生成"
              }
            />
          )}
          {/* 規約確認開始ボタン */}
          {!editor.context.hasSignedTerms && (
            <GenerationTermsButton
              termsMarkdownText={props.termsMarkdownText}
              onSubmit={onSignTerms}
            />
          )}
          {/* 生成キャンセル */}
          {generationMode === "reserve" && (
            <GenerationTasksCancelButton
              isDisabled={
                inProgressImageGenerationReservedTasksCount === 0 ||
                isDeletingReservedTasks
              }
              onCancel={onDeleteReservedTasks}
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
          passType={editor.context.passType}
          remainingImageGenerationTasksCount={tasksCount}
          standardPredictionGenerationSeconds={
            engineStatus?.standardPredictionGenerationSeconds ?? 0
          }
          standardTasksCount={engineStatus?.standardTasksCount ?? 0}
        />
      </div>
    </AppFixedContent>
  )
}
