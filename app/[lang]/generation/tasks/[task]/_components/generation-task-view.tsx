"use client"

import { InPaintingDialog } from "@/app/[lang]/generation/_components/editor-submission-view/in-painting-dialog"
import { StarRating } from "@/app/[lang]/generation/_components/editor-task-view/star-rating"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationMenuButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-menu-button"
import { InProgressImageGenerationTaskResult } from "@/app/[lang]/generation/tasks/[task]/_components/in-progress-image-generation-task-result"
import { GenerationParameters } from "@/app/[lang]/generation/tasks/[task]/_types/generation-parameters"
import {
  GenerationSize,
  parseGenerationSize,
} from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import { PrivateImage } from "@/app/_components/private-image"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { AppFixedContent } from "@/components/app/app-fixed-content"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { config } from "@/config"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { updateRatingImageGenerationTaskMutation } from "@/graphql/mutations/update-rating-image-generation-task"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { cn } from "@/lib/utils"
import { skipToken, useMutation, useSuspenseQuery } from "@apollo/client"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
  FileUp,
  LinkIcon,
  PenIcon,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"
import { CopyButton } from "./copy-button"
type Props = {
  taskId: string
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
 * 単一生成タスクの詳細画面
 * @param props
 * @returns
 */
export function GenerationTaskView(props: Props) {
  const context = useGenerationContext()

  const [mutation] = useMutation(updateRatingImageGenerationTaskMutation)

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const authContext = useContext(AuthContext)

  const [deleteTask] = useMutation(deleteImageGenerationTaskMutation)

  const [showInPaintDialog, setShowInPaintDialog] = useState(false)

  /**
   * 生成タスクの情報を取得する
   */
  const { data, error, refetch } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn
      ? {
          variables: {
            id: props.taskId,
          },
        }
      : skipToken,
  )

  const [rating, setRating] = useState(data?.imageGenerationTask.rating ?? 0)

  /**
   * レーティング変更
   */
  const onChangeRating = async (taskId: string, rating: number) => {
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

  /**
   * 復元
   */
  const onReference = () => {
    if (props.onRestore !== undefined) {
      props.onRestore(props.taskId)
    } else {
      window.location.href = `/generation/?ref=${props.taskId}`
    }
  }

  /**
   * インペイント
   */
  const onInPaint = () => {
    setShowInPaintDialog(true)
  }

  /**
   * 投稿画面に遷移
   */
  const onPost = () => {
    window.location.href = `https://www.aipictors.com/post?generation=${props.taskId}`
  }

  /**
   * 削除
   */
  const onDelete = async () => {
    await deleteTask({
      variables: {
        input: {
          nanoid: props.taskId,
        },
      },
    })
    refetch()
  }

  if (!data) {
    return (
      <div>
        <>
          <AppLoadingPage />
        </>
      </div>
    )
  }

  if (
    data.imageGenerationTask == null ||
    data.imageGenerationTask.token == null
  ) {
    return <div>{"画像が見つかりませんでした"}</div>
  }

  if (data?.imageGenerationTask.status === "CANCELED") {
    return <p className="mb-1 font-semibold text-center">{"キャンセル済み"}</p>
  }

  if (data?.imageGenerationTask.status === "ERROR") {
    return <p className="mb-1 font-semibold text-center">{"生成エラー"}</p>
  }

  const generationSize: GenerationSize = parseGenerationSize(
    data.imageGenerationTask.sizeType,
  )

  const userNanoid = context.user?.nanoid ?? null
  if (userNanoid === null) return

  const GenerationParameters: GenerationParameters = {
    prompt: data.imageGenerationTask.prompt,
    vae: data.imageGenerationTask.vae ?? "",
    negativePrompt: data.imageGenerationTask.negativePrompt,
    seed: data.imageGenerationTask.seed,
    steps: data.imageGenerationTask.steps,
    scale: data.imageGenerationTask.scale,
    sampler: data.imageGenerationTask.sampler,
    width: generationSize.width,
    height: generationSize.height,
    modelName: data.imageGenerationTask.model?.name ?? "",
  }

  if (data?.imageGenerationTask.status === "IN_PROGRESS") {
    return (
      <>
        <InProgressImageGenerationTaskResult />
      </>
    )
  }

  return (
    <>
      <ScrollArea
        className={`${isDesktop ? "p-4 w-full max-w-fit mx-auto" : ""}`}
      >
        <div
          className={`${isDesktop ? "p-4 w-full max-w-fit mx-auto" : ""} ${
            props.isScroll ? "max-h-[88vh]" : ""
          }`}
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button className={"px-2"} variant={"ghost"}>
                <PrivateImage
                  className={`max-h-screen m-auto generation-image-${props.taskId}`}
                  taskId={data.imageGenerationTask.id}
                  token={data.imageGenerationTask.token}
                  alt={"-"}
                />
              </Button>
            </DialogTrigger>
            <DialogContent className={"w-[auto] max-h-[96vh] max-w-[96vw]"}>
              <PrivateImage
                className={"h-[auto] max-h-[88vh] max-w-[88vw] m-auto"}
                taskId={data.imageGenerationTask.id}
                token={data.imageGenerationTask.token}
                alt={"-"}
              />
            </DialogContent>
          </Dialog>

          <div className="my-4 flex gap-x-2 justify-end">
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
              icon={FileUp}
            />
            <GenerationMenuButton
              title={"生成情報をコピーする"}
              onClick={() => copyGeneration(GenerationParameters)}
              icon={ClipboardCopy}
            />
            <GenerationMenuButton
              title={"URLをコピーする"}
              onClick={() => copyUrl(props.taskId)}
              icon={LinkIcon}
            />
            <GenerationMenuButton
              title={"画像を保存する"}
              onClick={() => saveGenerationImage(props.taskId)}
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
          <div className="py-2">
            <Separator />
          </div>
          <div className="my-4 flex gap-x-2 justify-end">
            <GenerationMenuButton
              title={"インペイント機能で一部分を再生成して修正する"}
              onClick={onInPaint}
              text={"部分修正"}
              icon={PenIcon}
            />
          </div>
          <StarRating
            value={rating ?? 0}
            onChange={(value) => {
              setRating(value)
              onChangeRating(props.taskId, value)
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
            <p>{data.imageGenerationTask.model?.name}</p>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <p className="mb-1 font-semibold">{"prompt"}</p>
          <Textarea disabled={true}>{data.imageGenerationTask.prompt}</Textarea>
          <CopyButton className="mt-2" text={data.imageGenerationTask.prompt} />
          <div className="py-2">
            <Separator />
          </div>
          <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
          <Textarea disabled={true}>
            {data.imageGenerationTask.negativePrompt}
          </Textarea>
          <CopyButton
            className="mt-2"
            text={data.imageGenerationTask.negativePrompt}
          />
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1">
            <p className="mb-1 font-semibold">{"Sampler"}</p>
            <p>{data.imageGenerationTask.sampler}</p>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="flex space-x-4">
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Seed"}</p>
              <p>{data.imageGenerationTask.seed}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Scale"}</p>
              <p>{data.imageGenerationTask.scale}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"ClipSkip"}</p>
              <p>{data.imageGenerationTask.clipSkip}</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {!isDesktop && (
        <AppFixedContent
          position="bottom"
          children={
            <div className="flex">
              <Link
                href="/generation"
                className={cn(
                  `flex-1 w-full ${config.isDevelopmentMode && "mr-2"}`,
                )}
              >
                <Button className="p-4 w-full" variant={"secondary"}>
                  画像生成
                </Button>
              </Link>
              {config.isDevelopmentMode && (
                <Link href="/generation/tasks" className="flex-1 w-full">
                  <Button className="p-4 w-full" variant={"secondary"}>
                    画像一覧
                  </Button>
                </Link>
              )}
            </div>
          }
        />
      )}

      <InPaintingDialog
        isOpen={showInPaintDialog}
        onClose={() => setShowInPaintDialog(false)}
        taskId={props.taskId}
        token={data.imageGenerationTask.token}
        userNanoid={userNanoid}
        configSeed={data.imageGenerationTask.seed}
        configSteps={data.imageGenerationTask.steps}
        configSampler={data.imageGenerationTask.sampler}
        configSizeType={data.imageGenerationTask.sizeType}
        configModel={data.imageGenerationTask.model?.name}
        configVae={data.imageGenerationTask.vae}
        configScale={data.imageGenerationTask.scale}
        configClipSkip={data.imageGenerationTask.clipSkip}
      />
    </>
  )
}
