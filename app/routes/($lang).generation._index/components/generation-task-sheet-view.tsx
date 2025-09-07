import { config, KeyCodes } from "~/config"
import { useCachedImageGenerationTask } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-task"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { downloadImageFile } from "~/routes/($lang).generation._index/utils/download-image-file"
import {
  GenerationImageResultSheetContentFragment,
  GenerationImageResultSheetContentTaskFragment,
  GenerationTaskSheetViewContent,
} from "~/routes/($lang).generation._index/components/generation-task-sheet-view-content"
import {
  InProgressGenerationImageResultFragment,
  InProgressGenerationImageResultTaskFragment,
  InProgressImageGenerationTaskResult,
} from "~/routes/($lang).generation._index/components/in-progress-image-generation-task-result"
import type { GenerationParameters } from "~/routes/($lang).generation._index/types/generation-parameters"
import {
  type GenerationSize,
  parseGenerationSize,
} from "~/routes/($lang).generation._index/types/generation-size"
import { useMutation } from "@apollo/client/index"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { type FragmentOf, graphql } from "gql.tada"
import { useCachedImageGenerationResult } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-result"

type Props = {
  task:
    | FragmentOf<typeof GenerationImageResultSheetFragment>
    | FragmentOf<typeof GenerationImageResultSheetTaskFragment>
  isReferenceLink?: boolean
  isScroll?: boolean
  setShowAiModificationDialog?: (show: boolean) => void
}

/**
 * 生成情報をクリップボードにコピーする
 * @param generationParameters
 */
export function copyGeneration(generationParameters: GenerationParameters) {
  const text = `${generationParameters.prompt}\nNegative prompt:${generationParameters.negativePrompt},\nSteps:${generationParameters.steps}, Size:${generationParameters.width}x${generationParameters.height}, Seed:${generationParameters.seed}, Model:${generationParameters.modelName}, Sampler:${generationParameters.sampler}, CFG scale:${generationParameters.scale}`

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast("クリップボードにコピーされました")
    })
    .catch((err) => {
      console.error("クリップボードへのコピーに失敗しました:", err)
    })
}

/**
 * URLをクリップボードにコピーする
 * @param generationParameters
 */
export function copyUrl(taskId: string) {
  const sitUrl = config.siteURL
  const text = `${sitUrl}/generation/tasks/${taskId}`

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast("クリップボードにコピーされました")
    })
    .catch((err) => {
      console.error("クリップボードへのコピーに失敗しました:", err)
    })
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴情報
 */
export function GenerationTaskSheetView(props: Props) {
  const [mutation, { loading: isRatingLoading }] = useMutation(
    updateRatingImageGenerationResultMutation,
    {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    },
  )

  /**
   * 生成履歴の画像を保存する
   * @param token
   */
  const saveGenerationImage = async (_fileName: string) => {
    // Type-safe property access
    const taskImageUrl =
      props.task && "imageUrl" in props.task ? props.task.imageUrl : null

    if (!taskImageUrl || typeof taskImageUrl !== "string") {
      toast("画像が存在しません")
      return
    }

    const name = `${new Date().toISOString().replace(/[^0-9]/g, "")}`

    downloadImageFile(name, taskImageUrl)
  }

  const context = useGenerationContext()

  const [rating, setRating] = useState(0)

  const [isProtected, setIsProtected] = useState(
    props.task.isProtected ?? false,
  )

  const [showAiModificationDialog, setShowAiModificationDialog] =
    useState(false)

  const onRestore = (isWithSeed: boolean) => {
    context.updateSettings(
      props.task.model.id,
      props.task.steps,
      props.task.model.type,
      props.task.sampler,
      props.task.scale,
      props.task.vae?.replace(".ckpt", "").replace(".safetensors", "") ?? "",
      props.task.prompt,
      props.task.negativePrompt,
      isWithSeed ? props.task.seed : -1,
      props.task.sizeType,
      props.task.clipSkip,
      null,
      null,
      null,
      null,
    )
    toast("設定を復元しました")
  }

  const onChangeRating = async (taskId: string, rating: number) => {
    if (taskId === "") {
      toast("選択できない履歴です")
      return
    }
    try {
      await mutation({
        variables: {
          input: {
            nanoid: taskId,
            rating: rating,
          },
        },
      })
      setRating(rating)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onReference = (isWithSeed: boolean) => {
    const taskNanoid =
      props.task && "nanoid" in props.task ? props.task.nanoid : null

    if (
      !props.isReferenceLink &&
      taskNanoid !== null &&
      typeof taskNanoid === "string"
    ) {
      onRestore(isWithSeed)
    } else if (
      props.isReferenceLink &&
      taskNanoid !== null &&
      typeof taskNanoid === "string"
    ) {
      window.location.href = `/generation/?ref=${taskNanoid}`
    } else {
      toast("不明なエラーです。")
    }
  }

  const onInPaint = () => {
    if (props.setShowAiModificationDialog) {
      props.setShowAiModificationDialog(true)
    } else {
      setShowAiModificationDialog(true)
    }
  }

  const setShowInPaintChange = (show: boolean) => {
    if (props.setShowAiModificationDialog) {
      props.setShowAiModificationDialog(true)
    } else {
      setShowAiModificationDialog(show)
    }
  }

  const onPost = () => {
    if (!imageGenerationTask) {
      toast("履歴が見つかりません、画面更新下さい。")
      return
    }

    const taskNanoid =
      imageGenerationTask && "nanoid" in imageGenerationTask
        ? imageGenerationTask.nanoid
        : null

    if (!taskNanoid || typeof taskNanoid !== "string") {
      toast("履歴が見つかりません、画面更新下さい。")
      return
    }

    const url = `/new/image?generation=${taskNanoid}`
    window.open(url, "_blank")
  }

  const [deleteTask, { loading: isDeletedLoading }] = useMutation(
    deleteImageGenerationResultMutation,
  )

  const onDelete = async () => {
    if (!imageGenerationTask) {
      toast("存在しない履歴です")
      return
    }

    const taskNanoid =
      imageGenerationTask && "nanoid" in imageGenerationTask
        ? imageGenerationTask.nanoid
        : null

    if (taskNanoid === null || typeof taskNanoid !== "string") {
      toast("存在しない履歴です")
      return
    }

    await deleteTask({
      variables: {
        input: {
          nanoid: taskNanoid,
        },
      },
    })
    toast("削除しました")
  }

  const [protectTask, { loading: isProtectedLoading }] = useMutation(
    updateProtectedImageGenerationResultMutation,
  )

  const toggleProtectedImage = async () => {
    const taskNanoid =
      props.task && "nanoid" in props.task ? props.task.nanoid : null

    if (taskNanoid === null || typeof taskNanoid !== "string") {
      toast("存在しない履歴です")
      return
    }

    await protectTask({
      variables: {
        input: {
          nanoid: taskNanoid,
          isProtected: !isProtected,
        },
      },
    })
    setIsProtected(!isProtected)
  }

  /**
   * 次のタスクに戻る
   * @returns
   */
  const onNextTask = () => {
    const nowTask = context.config.viewTaskId
    const taskIds = context.config.viewTaskIds
    if (nowTask === null || taskIds === null) return
    const index = taskIds.indexOf(nowTask)
    if (!taskIds.length || taskIds.length === index + 1) {
      return
    }
    const nextTaskId = taskIds[index + 1]
    context.updateViewTaskId(nextTaskId)
  }

  /**
   * 前のタスクに戻る
   * @returns
   */
  const onPrevTask = () => {
    const nowTask = context.config.viewTaskId
    const taskIds = context.config.viewTaskIds
    if (nowTask === null || taskIds === null) return
    const index = taskIds.indexOf(nowTask)
    if (!taskIds.length || index === 0) {
      return
    }
    // もし予約タスクなら何もしない
    if (taskIds[index - 1] === "RESERVED") {
      return
    }
    const nextTaskId = taskIds[index - 1]
    context.updateViewTaskId(nextTaskId)
  }

  /**
   * 左右キーで履歴切替
   */
  const handleDirectionKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 入力欄やテキストエリアにフォーカスしている場合は何もしない
      const tagName = document.activeElement?.tagName.toLowerCase()
      if (tagName === "input" || tagName === "textarea") {
        return
      }

      // 左キーが押された場合は前のタスクへ
      if (event.code === KeyCodes.ALLOW_LEFT) {
        onPrevTask()
      }
      // 右キーが押された場合は次のタスクへ
      if (event.code === KeyCodes.ALLOW_RIGHT) {
        onNextTask()
      }
    },
    [context], // ここで指定した依存配列に `onPrevTask` と `onNextTask` も含める必要があるかもしれません
  )

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleDirectionKeyDown)
      return () => {
        document.removeEventListener("keydown", handleDirectionKeyDown)
      }
    }
  }, [context])

  const generationSize: GenerationSize = parseGenerationSize(
    props.task.sizeType,
  )

  const GenerationParameters: GenerationParameters = {
    prompt: props.task.prompt,
    vae: props.task.vae ?? "",
    negativePrompt: props.task.negativePrompt,
    seed: props.task.seed,
    steps: props.task.steps,
    scale: props.task.scale,
    sampler: props.task.sampler,
    width: generationSize.width,
    height: generationSize.height,
    modelName: props.task.model?.name ?? "",
  }

  // Always call hooks at the top level
  const userNanoid = context.user?.nanoid ?? null
  const cachedImage = useCachedImageGenerationTask(
    context.config.viewTaskId ?? "",
  )
  const cachedResultImage = useCachedImageGenerationResult(
    context.config.viewTaskId ?? "",
  )

  const imageGenerationTask =
    props.task.id !== context.config.viewTaskId
      ? (cachedImage ?? cachedResultImage)
      : props.task

  useEffect(() => {
    if (imageGenerationTask && imageGenerationTask.status !== "IN_PROGRESS") {
      setRating(imageGenerationTask?.rating ?? 0)
      setIsProtected(imageGenerationTask?.isProtected ?? false)
    }
  }, [imageGenerationTask])

  // Early returns after hooks
  if (props.task.status === "IN_PROGRESS") {
    return <InProgressImageGenerationTaskResult task={props.task} />
  }

  if (userNanoid === null) return null

  if (!imageGenerationTask) return null

  return (
    <GenerationTaskSheetViewContent
      task={imageGenerationTask}
      isScroll={props.isScroll ?? false}
      isDisplayImageListButton={true}
      isListFullSize={false}
      showAiModificationDialog={showAiModificationDialog}
      userNanoid={userNanoid}
      generationSize={generationSize}
      rating={rating}
      isProtected={isProtected}
      GenerationParameters={GenerationParameters}
      isProtectedLoading={isProtectedLoading}
      isRatingLoading={isRatingLoading}
      isDeletedLoading={isDeletedLoading}
      onReference={onReference}
      onPost={onPost}
      onDelete={onDelete}
      onInPaint={onInPaint}
      onNextTask={onNextTask}
      onPrevTask={onPrevTask}
      onChangeRating={onChangeRating}
      toggleProtectedImage={toggleProtectedImage}
      setRating={setRating}
      setShowAiModificationDialog={setShowInPaintChange}
      saveGenerationImage={saveGenerationImage}
      copyGeneration={copyGeneration}
      copyUrl={copyUrl}
    />
  )
}

export const GenerationImageResultSheetFragment = graphql(
  `fragment GenerationImageResultSheet on ImageGenerationResultNode @_unmask {
    id
    model {
      id
      type
    }
    ...GenerationImageResultSheetContent
    ...InProgressGenerationImageResult
  }`,
  [
    GenerationImageResultSheetContentFragment,
    InProgressGenerationImageResultFragment,
  ],
)

export const GenerationImageResultSheetTaskFragment = graphql(
  `fragment GenerationImageResultSheetTask on ImageGenerationTaskNode @_unmask {
    id
    model {
      id
      type
    }
    ...GenerationImageResultSheetContentTask
    ...InProgressGenerationImageResultTask
  }`,
  [
    GenerationImageResultSheetContentTaskFragment,
    InProgressGenerationImageResultTaskFragment,
  ],
)

const viewerImageGenerationTasksQuery = graphql(
  `query ViewerImageGenerationTasks($offset: Int!, $limit: Int!, $where: ImageGenerationTasksWhereInput) {
    viewer {
      id
      imageGenerationTasks(offset: $offset, limit: $limit, where: $where) {
        ...GenerationImageResultSheetTask
      }
    }
  }`,
  [GenerationImageResultSheetTaskFragment],
)

const deleteImageGenerationResultMutation = graphql(
  `mutation deleteImageGenerationResult($input: DeleteImageGenerationResultInput!) {
    deleteImageGenerationResult(input: $input) {
      ...GenerationImageResultSheet
    }
  }`,
  [GenerationImageResultSheetFragment],
)

const updateProtectedImageGenerationResultMutation = graphql(
  `mutation updateProtectedImageGenerationResult($input: UpdateProtectedImageGenerationResultInput!) {
    updateProtectedImageGenerationResult(input: $input) {
      ...GenerationImageResultSheet
    }
  }`,
  [GenerationImageResultSheetFragment],
)

const updateRatingImageGenerationResultMutation = graphql(
  `mutation updateRatingImageGenerationResult($input: UpdateRatingImageGenerationResultInput!) {
    updateRatingImageGenerationResult(input: $input) {
      ...GenerationImageResultSheet
    }
  }`,
  [GenerationImageResultSheetFragment],
)
