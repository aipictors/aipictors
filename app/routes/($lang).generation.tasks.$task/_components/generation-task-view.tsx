import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { AppFixedContent } from "@/_components/app/app-fixed-content"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { PrivateImage } from "@/_components/private-image"
import { Button } from "@/_components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/_components/ui/dialog"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { Separator } from "@/_components/ui/separator"
import { AuthContext } from "@/_contexts/auth-context"
import { deleteImageGenerationTaskMutation } from "@/_graphql/mutations/delete-image-generation-task"
import { updateRatingImageGenerationTaskMutation } from "@/_graphql/mutations/update-rating-image-generation-task"
import { imageGenerationTaskQuery } from "@/_graphql/queries/image-generation/image-generation-task"
import { cn } from "@/_lib/utils"
import { config } from "@/config"
import { GenerationMenuButton } from "@/routes/($lang).generation.tasks.$task/_components/generation-menu-button"
import { GenerationTaskContentImagePlaceHolder } from "@/routes/($lang).generation.tasks.$task/_components/generation-task-content-image-place-holder"
import { InProgressImageGenerationTaskResult } from "@/routes/($lang).generation.tasks.$task/_components/in-progress-image-generation-task-result"
import type { GenerationParameters } from "@/routes/($lang).generation.tasks.$task/_types/generation-parameters"
import {
  type GenerationSize,
  parseGenerationSize,
} from "@/routes/($lang).generation.tasks.$task/_types/generation-size"
import {
  skipToken,
  useMutation,
  useSuspenseQuery,
} from "@apollo/client/index.js"
import { Link, useNavigate } from "@remix-run/react"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
  FileUp,
  LinkIcon,
  PenIcon,
  Trash2,
} from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"
import { CopyButton } from "./copy-button"
import { createImageFileFromUrl } from "@/routes/($lang).generation._index/_utils/create-image-file-from-url"
import { downloadImageFile } from "@/routes/($lang).generation._index/_utils/download-image-file"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { StarRating } from "@/routes/($lang).generation._index/_components/task-view/star-rating"
import { InPaintingDialog } from "@/routes/($lang).generation._index/_components/submission-view/in-painting-dialog"

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
export const saveGenerationImage = async (taskId: string) => {
  const imageElement = document.querySelector(
    `.generation-image-${taskId}`,
  ) as HTMLImageElement
  if (!imageElement) {
    toast("しばらくしてからお試し下さい。")
    return
  }
  if (imageElement.src !== undefined && imageElement.src !== "") {
    const image = await createImageFileFromUrl({ url: imageElement.src })
    downloadImageFile(image)
  }
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

  const [deleteTask, { loading: isDeletedLoading }] = useMutation(
    deleteImageGenerationTaskMutation,
  )

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
          fetchPolicy: "cache-first",
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
   * カンマ前までの文字列を取得
   * @param text
   * @returns
   */
  const extractStringBeforeComma = (text: string) => {
    const commaIndex = text.indexOf(".")
    if (commaIndex === -1) {
      return text
    }
    return text.substring(0, commaIndex)
  }

  /**
   * インペイント
   */
  const onInPaint = () => {
    if (
      context.currentPass?.type !== "LITE" &&
      context.currentPass?.type !== "STANDARD" &&
      context.currentPass?.type !== "PREMIUM" &&
      context.currentPass?.type !== "TWO_DAYS"
    ) {
      toast("インペイント機能はLITEプラン以上で利用可能です")
      return
    }
    setShowInPaintDialog(true)
  }

  /**
   * 投稿画面に遷移
   */
  const onPost = () => {
    window.location.href = `https://www.aipictors.com/post?generation=${props.taskId}`
  }

  const navigate = useNavigate()

  /**
   * 削除
   */
  const onDelete = async () => {
    deleteTask({
      variables: {
        input: {
          nanoid: props.taskId,
        },
      },
    })
    navigate("/generation")
    toast("削除しました")
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
    data.imageGenerationTask.status !== "RESERVED" &&
    (data.imageGenerationTask == null || data.imageGenerationTask.token == null)
  ) {
    return <div>{"画像が見つかりませんでした"}</div>
  }

  if (data?.imageGenerationTask.status === "CANCELED") {
    return <p className="mb-1 text-center font-semibold">{"キャンセル済み"}</p>
  }

  if (data?.imageGenerationTask.status === "ERROR") {
    return <p className="mb-1 text-center font-semibold">{"生成エラー"}</p>
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

  if (
    data?.imageGenerationTask.status === "IN_PROGRESS" ||
    data?.imageGenerationTask.status === "RESERVED"
  ) {
    return (
      <>
        <InProgressImageGenerationTaskResult task={data?.imageGenerationTask} />
      </>
    )
  }

  const upscaleSize =
    data.imageGenerationTask.upscaleSize !== null ||
    data.imageGenerationTask.upscaleSize
      ? data.imageGenerationTask.upscaleSize
      : 1
  const width = generationSize.width * upscaleSize
  const height = generationSize.height * upscaleSize

  return (
    <>
      <ScrollArea
        className={`${isDesktop ? "mx-auto w-full max-w-fit p-4" : ""}`}
      >
        <div
          className={`${isDesktop ? "mx-auto w-full max-w-fit p-4" : ""}${
            props.isScroll ? "max-h-[88vh]" : ""
          }`}
        >
          {data.imageGenerationTask.token && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className={"px-2"} variant={"ghost"}>
                  <Suspense
                    fallback={
                      <GenerationTaskContentImagePlaceHolder
                        className={"m-auto h-80 max-h-96 w-80 max-w-['50vw']"}
                      />
                    }
                  >
                    <PrivateImage
                      // biome-ignore lint/nursery/useSortedClasses: <explanation>
                      className={`generation-image-${props.taskId} m-auto max-h-screen`}
                      taskId={data.imageGenerationTask.id}
                      token={data.imageGenerationTask.token}
                      isThumbnail={true}
                      alt={"-"}
                    />
                  </Suspense>
                </Button>
              </DialogTrigger>
              <DialogContent className={"max-h-[96vh] w-[auto] max-w-[96vw]"}>
                <Suspense
                  fallback={
                    <GenerationTaskContentImagePlaceHolder
                      className={"h-72 max-h-96 w-72 max-w-['50vw']"}
                    />
                  }
                >
                  <PrivateImage
                    className={"m-auto h-[auto] max-h-[88vh] max-w-[80vw]"}
                    taskId={data.imageGenerationTask.id}
                    token={data.imageGenerationTask.token}
                    isThumbnail={false}
                    alt={"-"}
                  />
                </Suspense>
              </DialogContent>
            </Dialog>
          )}
          <div className="flex flex-wrap justify-end gap-x-2 gap-y-2 pt-2">
            <GenerationMenuButton
              title={"同じ情報で生成する"}
              onClick={onReference}
              text={"再利用"}
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
                isLoading={isDeletedLoading}
                disabled={isDeletedLoading}
              />
            </AppConfirmDialog>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="my-4 flex items-center gap-x-2">
            <StarRating
              value={rating ?? 0}
              onChange={(value) => {
                setRating(value)
                onChangeRating(props.taskId, value)
              }}
            />
            <div className="ml-auto">
              <GenerationMenuButton
                title={"インペイント機能で一部分を再生成して修正する"}
                onClick={onInPaint}
                text={"部分修正"}
                icon={PenIcon}
              />
            </div>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1 flex gap-x-2">
            <div className="basis-1/3">
              <p className="mb-1 font-semibold">{"Size"}</p>
              <p>
                {width}x{height}
              </p>
            </div>
            <div className="basis-1/3">
              <p className="mb-1 font-semibold">{"Model"}</p>
              <p>
                {extractStringBeforeComma(data.imageGenerationTask.model?.name)}
              </p>
            </div>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <p className="mb-1 font-semibold">{"prompt"}</p>
          <p className="max-h-24 overflow-y-auto rounded-md border p-2 text-sm">
            {data.imageGenerationTask.prompt}
          </p>
          <CopyButton text={data.imageGenerationTask.prompt} />
          <div className="py-2">
            <Separator />
          </div>
          <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
          <p className="max-h-24 overflow-y-auto rounded-md border p-2 text-sm">
            {data.imageGenerationTask.negativePrompt}
          </p>
          <CopyButton text={data.imageGenerationTask.negativePrompt} />
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1 flex max-w-[100vw] space-x-4">
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Scale"}</p>
              <p>{data.imageGenerationTask.scale}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Steps"}</p>
              <p>{data.imageGenerationTask.steps}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Sampler"}</p>
              <p>{data.imageGenerationTask.sampler}</p>
            </div>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="flex max-w-[100vw] space-x-4">
            <div className="w-full">
              <p className="mb-1 font-semibold">{"ClipSkip"}</p>
              <p>{data.imageGenerationTask.clipSkip}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Vae"}</p>
              <p>{data.imageGenerationTask.vae}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Seed"}</p>
              <p>{data.imageGenerationTask.seed}</p>
            </div>
          </div>
          {(data.imageGenerationTask.controlNetModule ||
            data.imageGenerationTask.controlNetWeight) && (
            <>
              <div className="py-2">
                <Separator />
              </div>
              <div className="flex space-x-4">
                {data.imageGenerationTask.controlNetModule && (
                  <div className="w-full space-y-1">
                    <p className="font-bold">{"Module"}</p>
                    <p>{data.imageGenerationTask.controlNetModule}</p>
                  </div>
                )}
                {data.imageGenerationTask.controlNetWeight && (
                  <div className="w-full space-y-1">
                    <p className="font-bold">{"Weight"}</p>
                    <p>{data.imageGenerationTask.controlNetWeight}</p>
                  </div>
                )}
                <div className="w-full space-y-1" />
              </div>
            </>
          )}
          <div className="mb-32" />
        </div>
      </ScrollArea>

      {!isDesktop && (
        <AppFixedContent position="bottom">
          <div className="flex">
            <Link
              to="/generation"
              className={cn(
                `w-full flex-1${config.isDevelopmentMode && "mr-2"}`,
              )}
            >
              <Button className="w-full" variant={"secondary"}>
                詳細を閉じる
              </Button>
            </Link>
          </div>
        </AppFixedContent>
      )}

      {data.imageGenerationTask.token && (
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
      )}
    </>
  )
}
