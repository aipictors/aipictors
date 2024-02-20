"use client"

import { StarRating } from "@/app/[lang]/generation/_components/editor-task-list-view-view/star-rating"
import { GenerationImageDialogButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-image-dialog-button"
import { GenerationMenuButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-menu-button"
import { InProgressImageGenerationTaskResult } from "@/app/[lang]/generation/tasks/[task]/_components/in-progress-image-generation-task-result"
import { GenerationParameters } from "@/app/[lang]/generation/tasks/[task]/_types/generation-parameters"
import {
  GenerationSize,
  parseGenerationSize,
} from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import { PrivateImage } from "@/app/_components/private-image"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { config } from "@/config"
import { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { updateRatingImageGenerationTaskMutation } from "@/graphql/mutations/update-rating-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { cn } from "@/lib/utils"
import { useMutation } from "@apollo/client"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
  Pencil,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"
import { CopyButton } from "./copy-button"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  onRestore?: (taskId: string) => void
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
 * @param props
 * @returns
 */
export function GenerationTaskCacheView(props: Props) {
  const [mutation] = useMutation(updateRatingImageGenerationTaskMutation, {
    refetchQueries: [viewerImageGenerationTasksQuery],
    awaitRefetchQueries: true,
  })

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

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
    if (props.onRestore !== undefined && props.task.nanoid !== null) {
      props.onRestore(props.task.nanoid)
    } else if (props.onRestore === undefined && props.task.nanoid !== null) {
      window.location.href = `/generation/?ref=${props.task.nanoid ?? ""}`
    } else {
      toast("不明なエラーです。")
    }
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

  return (
    <>
      <ScrollArea className={cn({ "w-full max-w-fit mx-auto": isDesktop })}>
        <div
          className={cn("space-y-2", {
            "p-4 w-full max-w-fit mx-auto": isDesktop,
            "max-h-[88vh]": props.isScroll,
          })}
        >
          <GenerationImageDialogButton
            taskId={props.task.id}
            taskToken={props.task.token}
            children={
              <PrivateImage
                className={`max-h-screen m-auto generation-image-${props.task.id}`}
                taskId={props.task.id}
                token={props.task.token as string}
                alt={"-"}
              />
            }
          />
          <div className="flex gap-x-2">
            <GenerationMenuButton
              title={"同じ情報で生成する"}
              onClick={onReference}
              text={"復元"}
              icon={ArrowUpRightSquare}
            />
            <GenerationMenuButton
              title={"投稿する"}
              onClick={onPost}
              text={"投稿"}
              icon={Pencil}
            />
            <GenerationMenuButton
              title={"生成情報をコピーする"}
              onClick={() => copyGeneration(GenerationParameters)}
              icon={ClipboardCopy}
            />
            <GenerationMenuButton
              title={"画像を保存する"}
              onClick={() => saveGenerationImage(props.task.id)}
              icon={ArrowDownToLine}
            />
            <AppConfirmDialog
              title={"確認"}
              description={"本当に削除しますか？"}
              onNext={() => {
                onDelete()
              }}
              onCancel={() => {}}
            >
              <GenerationMenuButton
                title={"生成履歴を削除する"}
                onClick={() => () => {}}
                icon={Trash2}
              />
            </AppConfirmDialog>
          </div>
          <StarRating
            value={rating ?? 0}
            onChange={(value) => {
              setRating(value)
              onChangeRating(props.task.nanoid ?? "", value)
            }}
          />
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1">
            <p className="mb-1 font-semibold">{"Size"}</p>
            <p>
              {generationSize.width}x{generationSize.height}
            </p>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1">
            <p className="mb-1 font-semibold">{"Model"}</p>
            <p>{props.task.model?.name}</p>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <p className="mb-1 font-semibold">{"prompt"}</p>
          <Textarea disabled={true}>{props.task.prompt}</Textarea>
          <CopyButton className="mb-4" text={props.task.prompt} />
          <div className="py-2">
            <Separator />
          </div>
          <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
          <Textarea disabled={true}>{props.task.negativePrompt}</Textarea>
          <CopyButton className="mb-4" text={props.task.negativePrompt} />
          <div className="py-2">
            <Separator />
          </div>
          <div className="flex space-x-4">
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Seed"}</p>
              <p>{props.task.seed}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Sampler"}</p>
              <p>{props.task.sampler}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Scale"}</p>
              <p>{props.task.scale}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
      {!isDesktop && (
        <Link href="/generation/tasks">
          <Button className="w-full p-4 mt-16 mb-4" variant={"secondary"}>
            画像一覧
          </Button>
        </Link>
      )}
    </>
  )
}
