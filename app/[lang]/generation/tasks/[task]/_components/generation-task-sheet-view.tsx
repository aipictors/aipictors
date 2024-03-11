"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetViewContent } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view-content"
import { InProgressImageGenerationTaskResult } from "@/app/[lang]/generation/tasks/[task]/_components/in-progress-image-generation-task-result"
import type { GenerationParameters } from "@/app/[lang]/generation/tasks/[task]/_types/generation-parameters"
import {
  type GenerationSize,
  parseGenerationSize,
} from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import { config } from "@/config"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { updateRatingImageGenerationTaskMutation } from "@/graphql/mutations/update-rating-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
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
 * @param taskId
 * @returns
 */
export const saveGenerationImage = (taskId: string) => {
  const imageElement = document.querySelector(
    `.generation-image-${taskId}`,
  ) as HTMLImageElement
  if (!imageElement) {
    return
  }
  const imageUrl = imageElement.src
  const link = document.createElement("a")
  link.href = imageUrl
  link.download = `${taskId}.png`
  link.click()
}

/**
 * 生成履歴から生成情報を保持して投稿画面に遷移する
 */
export const postGenerationImage = async (
  generationParameters: GenerationParameters,
  taskId: string,
) => {
  async function getBase64ImageFromUrl(url: string) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", url, true)
      xhr.responseType = "blob"

      xhr.onload = () => {
        if (xhr.status === 200) {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result)
          }
          reader.readAsDataURL(xhr.response)
        } else {
          reject(new Error("Failed to load image."))
        }
      }

      xhr.onerror = () => {
        reject(new Error("Failed to load image."))
      }

      xhr.send()
    })
  }

  const imageElement = document.querySelector(
    `.generation-image-${taskId}`,
  ) as HTMLImageElement
  if (!imageElement) {
    return
  }
  const imageUrl = imageElement.src
  // 画像をbase64に変換してローカルストレージに保存
  localStorage.clear()
  const base64Image: string = (await getBase64ImageFromUrl(imageUrl)) as string
  localStorage.setItem("post-image-temp", base64Image)

  // その他の情報をオブジェクトにまとめてJSON形式でローカルストレージに保存
  const postData = {
    model: generationParameters.modelName,
    vae: generationParameters.vae,
    prompts: generationParameters.prompt,
    negativePrompts: generationParameters.negativePrompt,
    seed: generationParameters.seed,
    steps: generationParameters.steps,
    scale: generationParameters.scale,
    sampler: generationParameters.sampler,
    width: generationParameters.width,
    height: generationParameters.height,
    type: "image",
  }
  const postDataJson = JSON.stringify(postData)
  localStorage.setItem("post-data-temp", postDataJson)

  window.location.href = "https://www.aipictors.com/post"
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴情報
 * @param props
 * @returns
 */
export function GenerationTaskSheetView(props: Props) {
  const [mutation] = useMutation(updateRatingImageGenerationTaskMutation, {
    refetchQueries: [viewerImageGenerationTasksQuery],
    awaitRefetchQueries: true,
  })

  const context = useGenerationContext()

  const viewTaskId = context.config.viewTaskId

  const viewTaskIds = context.config.viewTaskIds

  const [showInPaintDialog, setShowInPaintDialog] = useState(false)

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const onRestore = () => {
    context.updateSettings(
      props.task.model.id,
      props.task.steps,
      props.task.model.type,
      props.task.sampler,
      props.task.scale,
      props.task.vae ?? "",
      props.task.prompt,
      props.task.negativePrompt,
      props.task.seed,
      props.task.sizeType,
      props.task.clipSkip,
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
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const [rating, setRating] = useState(props.task.rating ?? 0)

  const onReference = () => {
    if (!props.isReferenceLink && props.task.nanoid !== null) {
      onRestore()
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

  const [deleteTask] = useMutation(deleteImageGenerationTaskMutation)

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
  }

  /**
   * 次のタスクに戻る
   * @returns
   */
  const onNextTask = () => {
    const nowTask = viewTaskId
    const taskIds = viewTaskIds
    if (nowTask === null || taskIds === null) return
    const index = taskIds.indexOf(nowTask)
    if (!taskIds.length || taskIds.length === index + 1) {
      toast("次の履歴がありません")
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
    const nowTask = viewTaskId
    const taskIds = viewTaskIds
    if (nowTask === null || taskIds === null) return
    const index = taskIds.indexOf(nowTask)
    if (!taskIds.length || index === 0) {
      toast("前の履歴がありません")
      return
    }
    const nextTaskId = taskIds[index - 1]
    context.updateViewTaskId(nextTaskId)
  }

  /**
   * 左右キーで履歴切替
   */
  const handleDirectionKeyDown = useCallback(
    (event: { keyCode: number }) => {
      if (event.keyCode === 37) {
        onPrevTask()
      }
      if (event.keyCode === 39) {
        onNextTask()
      }
    },
    [context],
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
    return <InProgressImageGenerationTaskResult />
  }

  const userNanoid = context.user?.nanoid ?? null
  if (userNanoid === null) return

  if (isDesktop) {
    return (
      <GenerationTaskSheetViewContent
        task={props.task}
        isScroll={props.isScroll ?? false}
        isDisplayImageListButton={false}
        isListFullSize={true}
        showInPaintDialog={showInPaintDialog}
        userNanoid={userNanoid}
        generationSize={generationSize}
        rating={rating}
        GenerationParameters={GenerationParameters}
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
        copyGeneration={copyGeneration}
        copyUrl={copyUrl}
      />
    )
  }

  return (
    <GenerationTaskSheetViewContent
      task={props.task}
      isScroll={props.isScroll ?? false}
      isDisplayImageListButton={true}
      isListFullSize={false}
      showInPaintDialog={showInPaintDialog}
      userNanoid={userNanoid}
      generationSize={generationSize}
      rating={rating}
      GenerationParameters={GenerationParameters}
      onReference={onReference}
      onPost={onPost}
      onDelete={onDelete}
      onInPaint={onInPaint}
      onNextTask={onNextTask}
      onPrevTask={onPrevTask}
      onChangeRating={onChangeRating}
      setRating={setRating}
      setShowInPaintDialog={setShowInPaintDialog}
      saveGenerationImage={saveGenerationImage}
      copyGeneration={copyGeneration}
      copyUrl={copyUrl}
    />
  )
}
