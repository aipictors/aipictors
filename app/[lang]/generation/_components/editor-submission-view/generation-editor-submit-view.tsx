"use client"

import { GenerationCountSelect } from "@/app/[lang]/generation/_components/editor-submission-view/generation-count-select"
import { GenerationReserveCountInput } from "@/app/[lang]/generation/_components/editor-submission-view/generation-reserve-count-input"
import { GenerationEditorProgress } from "@/app/[lang]/generation/_components/editor-submission-view/generation-status-progress"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"
import { AppFixedContent } from "@/components/app/app-fixed-content"
import { Checkbox } from "@/components/ui/checkbox"
import { config } from "@/config"
import {
  ImageGenerationSizeType,
  ImageModelsQuery,
} from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
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

  const { data: status } = useQuery(viewerImageGenerationStatusQuery, {
    pollInterval: isCreatingTask ? 10000 : 1000,
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
        // スマホだと生成ボタンに被るのでPCのみ出す
        toast("タスクを作成しました")
      }
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

  return (
    <AppFixedContent position="bottom">
      <div className="space-y-2">
        <div className="flex items-center">
          {config.isDevelopmentMode && (
            <div className="flex items-center w-20 space-x-2">
              <>
                <Checkbox
                  id="generation-mode-checkbox"
                  onCheckedChange={onChangeGenerationMode}
                />
                <label
                  htmlFor="generation-mode-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  予約
                </label>
              </>
            </div>
          )}
          {generationMode === "normal" && (
            <GenerationCountSelect
              pass={editor.context.passType ?? "FREE"}
              selectedCount={generationCount}
              onChange={setGenerationCount}
            />
          )}
          {generationMode === "reserve" && (
            <GenerationReserveCountInput
              maxCount={200}
              onChange={setGenerationCount}
            />
          )}
          {/* 生成開始ボタン */}
          {editor.context.hasSignedTerms && (
            <GenerationSubmitButton
              onClick={onCreateTask}
              isLoading={isCreatingTask}
              isDisabled={editor.context.isDisabled}
              generatingCount={inProgressImageGenerationTasksCount}
              maxGeneratingCount={
                generationMode === "reserve" ? 200 : maxTasksCount
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
