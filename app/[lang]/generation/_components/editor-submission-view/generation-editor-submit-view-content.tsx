import { GenerationCountSelect } from "@/app/[lang]/generation/_components/editor-submission-view/generation-count-select"
import { GenerationEditorProgress } from "@/app/[lang]/generation/_components/editor-submission-view/generation-status-progress"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { ImageGenerationContextView } from "@/app/[lang]/generation/_machines/models/image-generation-context-view"
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
  /**
   * ユーザID
   */
  userNanoid: string | null
  termsMarkdownText: string
  /**
   * 規約に同意済みである
   */
  hasSignedTerms: boolean
  /**
   * 画像生成が無効である
   */
  isDisabled: boolean
  /**
   * サブスクの種類
   */
  passType: string | null

  modelId: string

  /**
   * TODO: Providerに変更
   */
  context: ImageGenerationContextView
}

export function GenerationEditorSubmissionViewContent(props: Props) {
  const [generationCount, setGenerationCount] = useState(1)

  const { data: status } = useQuery(viewerImageGenerationStatusQuery, {
    pollInterval: 1000,
  })

  const [signTerms] = useMutation(signImageGenerationTermsMutation, {
    refetchQueries: [viewerCurrentPassQuery],
    awaitRefetchQueries: true,
  })

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
   * タスクを作成する
   */
  const onCreateTask = async () => {
    if (!props.hasSignedTerms) return
    const userNanoid = props.userNanoid ?? null
    if (userNanoid === null) return

    /**
     * 同時生成可能枚数
     */
    const inProgressImageGenerationTasksCount =
      status?.viewer?.inProgressImageGenerationTasksCount === undefined
        ? 1
        : status?.viewer?.inProgressImageGenerationTasksCount

    // 生成中かつフリープランならサブスクに誘導
    if (inProgressImageGenerationTasksCount !== 0 && !props.passType) {
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
        return model.id === props.modelId
      })
      if (typeof model === "undefined") return
      const taskCounts = Array.from({ length: generationCount }, (_, i) => i)
      const promises = taskCounts.map(() =>
        createTask({
          variables: {
            input: {
              count: 1,
              model: model.name,
              vae: props.context.vae ?? "",
              prompt: props.context.promptText,
              negativePrompt: props.context.negativePromptText,
              seed: props.context.seed,
              steps: props.context.steps,
              scale: props.context.scale,
              sampler: props.context.sampler,
              // clipSkip: 2, TODO: 補完されたら差し替え
              sizeType: props.context.sizeType as ImageGenerationSizeType,
              type: "TEXT_TO_IMAGE",
            },
          },
        }),
      )
      await Promise.all(promises)
      // タスクの作成後も呼び出す必要がある
      await activeImageGeneration({ nanoid: userNanoid })
      toast("タスクを作成しました")
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

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center">
          <GenerationCountSelect
            pass={props.passType ?? "FREE"}
            selectedCount={generationCount}
            onChange={setGenerationCount}
          />
          {/* 生成開始ボタン */}
          {props.hasSignedTerms && (
            <GenerationSubmitButton
              onClick={onCreateTask}
              isLoading={isCreatingTask}
              isDisabled={props.isDisabled}
              generatingCount={inProgressImageGenerationTasksCount}
              maxGeneratingCount={maxTasksCount}
            />
          )}
          {/* 規約確認開始ボタン */}
          {!props.hasSignedTerms && (
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
          passType={props.passType}
          remainingImageGenerationTasksCount={tasksCount}
          standardPredictionGenerationSeconds={
            engineStatus?.standardPredictionGenerationSeconds ?? 0
          }
          standardTasksCount={engineStatus?.standardTasksCount ?? 0}
        />
      </div>
    </>
  )
}
