import type { ImageGenerationTaskFieldsFragment } from "@/_graphql/__generated__/graphql"
import { deleteImageGenerationTaskMutation } from "@/_graphql/mutations/delete-image-generation-task"
import { updateProtectedImageGenerationTaskMutation } from "@/_graphql/mutations/update-protected-image-generation-task"
import { updateRatingImageGenerationTaskMutation } from "@/_graphql/mutations/update-rating-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/_graphql/queries/viewer/viewer-image-generation-tasks"
import { config } from "@/config"
import { useCachedImageGenerationTask } from "@/routes/($lang).generation._index/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { createImageFileFromUrl } from "@/routes/($lang).generation._index/_utils/create-image-file-from-url"
import { downloadImageFile } from "@/routes/($lang).generation._index/_utils/download-image-file"
import { GenerationTaskSheetViewContent } from "@/routes/($lang).generation.tasks.$task/_components/generation-task-sheet-view-content"
import { InProgressImageGenerationTaskResult } from "@/routes/($lang).generation.tasks.$task/_components/in-progress-image-generation-task-result"
import type { GenerationParameters } from "@/routes/($lang).generation.tasks.$task/_types/generation-parameters"
import {
  type GenerationSize,
  parseGenerationSize,
} from "@/routes/($lang).generation.tasks.$task/_types/generation-size"
import { useMutation } from "@apollo/client/index.js"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  isReferenceLink?: boolean
  isScroll?: boolean
}

/**
 * 生成情報をクリップボードにコピーする
 * @param generationParameters
 */
export const copyGeneration = (generationParameters: GenerationParameters) => {
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
export const copyUrl = (taskId: string) => {
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
 * 生成履歴の画像を保存する
 * @param token
 * @returns
 */
export const saveGenerationImage = async (token: string) => {
  const image = await createImageFileFromUrl({
    url: `https://www.aipictors.com/wp-content/themes/AISite/private-image-direct.php?token=${encodeURIComponent(
      token,
    )}`,
  })
  downloadImageFile(image)
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴情報
 * @param props
 * @returns
 */
export function GenerationTaskSheetView(props: Props) {
  const [mutation, { loading: isRatingLoading }] = useMutation(
    updateRatingImageGenerationTaskMutation,
    {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    },
  )

  const context = useGenerationContext()

  const [rating, setRating] = useState(0)

  const [isProtected, setIsProtected] = useState(
    props.task.isProtected ?? false,
  )

  const [showInPaintDialog, setShowInPaintDialog] = useState(false)

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

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
    if (!props.isReferenceLink && props.task.nanoid !== null) {
      onRestore(isWithSeed)
    } else if (props.isReferenceLink && props.task.nanoid !== null) {
      window.location.href = `/generation/?ref=${props.task.nanoid ?? ""}`
    } else {
      toast("不明なエラーです。")
    }
  }

  const onInPaint = () => {
    setShowInPaintDialog(true)
  }

  const onPost = () => {
    window.location.href = `https://www.aipictors.com/post?generation=${
      props.task.nanoid ?? ""
    }`
  }

  const [deleteTask, { loading: isDeletedLoading }] = useMutation(
    deleteImageGenerationTaskMutation,
  )

  const onDelete = async () => {
    if (props.task.nanoid === null) {
      toast("存在しない履歴です")
      return
    }
    await deleteTask({
      variables: {
        input: {
          nanoid: props.task.nanoid,
        },
      },
    })
    toast("削除しました")
  }

  const [protectTask, { loading: isProtectedLoading }] = useMutation(
    updateProtectedImageGenerationTaskMutation,
  )

  const toggleProtectedImage = async () => {
    if (props.task.nanoid === null) {
      toast("存在しない履歴です")
      return
    }
    await protectTask({
      variables: {
        input: {
          nanoid: props.task.nanoid,
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
      if (event.code === "ArrowLeft") {
        onPrevTask()
      }
      // 右キーが押された場合は次のタスクへ
      if (event.code === "ArrowRight") {
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

  if (props.task.status === "IN_PROGRESS") {
    return <InProgressImageGenerationTaskResult task={props.task} />
  }

  const userNanoid = context.user?.nanoid ?? null
  if (userNanoid === null) return

  const imageGenerationTask =
    props.task.id !== context.config.viewTaskId
      ? useCachedImageGenerationTask(context.config.viewTaskId ?? "")
      : props.task

  useEffect(() => {
    if (imageGenerationTask) {
      setRating(imageGenerationTask.rating ?? 0)
      setIsProtected(imageGenerationTask.isProtected ?? false)
    }
  }, [context.config.viewTaskId])

  if (!imageGenerationTask) return null

  if (isDesktop) {
    return (
      <GenerationTaskSheetViewContent
        task={imageGenerationTask}
        isScroll={props.isScroll ?? false}
        isDisplayImageListButton={false}
        isListFullSize={true}
        showInPaintDialog={showInPaintDialog}
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
        onChangeRating={onChangeRating}
        onNextTask={onNextTask}
        onPrevTask={onPrevTask}
        setRating={setRating}
        setShowInPaintDialog={setShowInPaintDialog}
        saveGenerationImage={saveGenerationImage}
        toggleProtectedImage={toggleProtectedImage}
        copyGeneration={copyGeneration}
        copyUrl={copyUrl}
      />
    )
  }

  return (
    <GenerationTaskSheetViewContent
      task={imageGenerationTask}
      isScroll={props.isScroll ?? false}
      isDisplayImageListButton={true}
      isListFullSize={false}
      showInPaintDialog={showInPaintDialog}
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
      setShowInPaintDialog={setShowInPaintDialog}
      saveGenerationImage={saveGenerationImage}
      copyGeneration={copyGeneration}
      copyUrl={copyUrl}
    />
  )
}
