import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  ArrowDownToLineIcon,
  ArrowUpRightSquareIcon,
  CopyIcon,
  FileUpIcon,
  InfoIcon,
  Loader2Icon,
  RotateCwIcon,
  Share2Icon,
  StarIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { GenerationReferenceDialog } from "~/routes/($lang).generation._index/components/generation-reference-dialog-button"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useCachedImageGenerationResult } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-result"
import { useCachedImageGenerationTask } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-task"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationScheduler } from "~/routes/($lang).generation._index/hooks/use-generation-scheduler"
import { toTaskSizeType } from "~/routes/($lang).generation._index/types/generation-size"
import { downloadImageFile } from "~/routes/($lang).generation._index/utils/download-image-file"
import { openPostPage } from "~/routes/($lang).generation._index/utils/open-post-page"
import { toPngParametersText } from "~/routes/($lang).generation._index/utils/png-generation-parameters"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"
import { toJstFileTimestamp } from "~/utils/to-jst-file-timestamp"

type Props = {
  /** 中央に出している生成結果の ID */
  resultId: string
  /** 同じ設定で Seed だけ変えて生成する（生成ボタンと同じ処理） */
  onReroll?: () => void
}

/**
 * 3 カラムの生成画面で、中央の生成画像の下に並べる操作（保存・共有・投稿・再生成・設定の再利用・お気に入り・詳細）。
 * 処理は履歴詳細（GenerationTaskSheetView）と同じものを使う
 */
export function GenerationCanvasActions(props: Props) {
  const t = useTranslation()

  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const [, setScheduler] = useGenerationScheduler()

  const cachedResult = useCachedImageGenerationResult(props.resultId)

  const cachedTask = useCachedImageGenerationTask(props.resultId)

  // 履歴の一覧をまだ読んでいないときだけ、この 1 件を読む
  const { data } = useQuery(GenerationCanvasActionsResultQuery, {
    variables: { id: props.resultId },
    skip: cachedResult !== null || cachedTask !== null,
    fetchPolicy: "cache-first",
  })

  const task = cachedResult ?? cachedTask ?? data?.imageGenerationResult ?? null

  const [rating, setRating] = useState(task?.rating ?? 0)

  useEffect(() => {
    setRating(task?.rating ?? 0)
  }, [task?.id, task?.rating])

  const [updateRating, { loading: isRatingLoading }] = useMutation(
    GenerationCanvasActionsRatingMutation,
  )

  const [isSharing, setIsSharing] = useState(false)

  if (task === null || !task.imageUrl) return null

  const imageUrl = normalizeGenerativeFileUrl(task.imageUrl)

  const fileName = toJstFileTimestamp()

  const onSave = () => {
    // 生成情報が入っていない PNG（生成サーバーによる）には、生成履歴の内容を書き込む
    void downloadImageFile(fileName, imageUrl, {
      convertToPng: true,
      pngParameters: toPngParametersText(task),
    })
  }

  const fetchImageFile = async () => {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const extension = blob.type.split("/")[1] ?? "png"
    return new File([blob], `aipictors-${fileName}.${extension}`, {
      type: blob.type,
    })
  }

  const canShareFiles =
    typeof navigator !== "undefined" && typeof navigator.share === "function"

  const onShareFile = async () => {
    setIsSharing(true)
    try {
      const file = await fetchImageFile()
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        toast(
          t(
            "このブラウザでは画像を共有できません",
            "This browser cannot share images",
          ),
        )
        return
      }
      await navigator.share({ files: [file] })
    } catch (error) {
      // 共有シートを閉じただけなら何もしない
      if (error instanceof Error && error.name === "AbortError") return
      toast(t("共有できませんでした", "Could not share"))
    } finally {
      setIsSharing(false)
    }
  }

  const onCopyImage = async () => {
    setIsSharing(true)
    try {
      const file = await fetchImageFile()
      // クリップボードは PNG だけ受け付けるブラウザが多いので、PNG に描き直す
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement("canvas")
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0)
      const png = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      )
      if (png === null) throw new Error("toBlob")
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })])
      toast(t("画像をコピーしました", "Image copied"))
    } catch {
      toast(t("画像をコピーできませんでした", "Could not copy the image"))
    } finally {
      setIsSharing(false)
    }
  }

  const onShareX = () => {
    const text = t(
      "Aipictorsで画像を生成しました #Aipictors #AIイラスト",
      "I made this with Aipictors #Aipictors #AIart",
    )
    const url = "https://www.aipictors.com/generation"
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  const onPost = () => {
    if (!task.nanoid) {
      toast("履歴が見つかりません、画面更新下さい。")
      return
    }
    openPostPage(`/new/image?generation=${task.nanoid}`)
  }

  const onRestore = (isWithSeed: boolean) => {
    context.updateSettings(
      task.model.id,
      task.steps,
      task.model.type,
      task.sampler,
      task.scale,
      task.vae?.replace(".ckpt", "").replace(".safetensors", "") ?? "",
      task.prompt,
      task.negativePrompt,
      isWithSeed ? task.seed : -1,
      toTaskSizeType(task),
      task.clipSkip,
      null,
      null,
      null,
      null,
    )
    setScheduler(task.scheduler ?? null)
    toast("設定を復元しました")
  }

  const onReroll = () => {
    if (!props.onReroll) return
    onRestore(false)
    requestAnimationFrame(() => props.onReroll?.())
  }

  const onToggleFavorite = async () => {
    if (!task.nanoid) {
      toast("選択できない履歴です")
      return
    }
    const nextRating = rating > 0 ? 0 : 1
    try {
      await updateRating({
        variables: { input: { nanoid: task.nanoid, rating: nextRating } },
      })
      setRating(nextRating)
    } catch (error) {
      if (error instanceof Error) toast(error.message)
    }
  }

  const onOpenDetails = () => {
    context.updateViewTaskId(task.id)
    send({ type: "OPEN_FULL_HISTORY_ON_MAIN_AND_HEADER" })
  }

  const buttonClassName = "h-9 gap-1.5 rounded-full px-3.5"

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        className={buttonClassName}
        title={t("画像を保存する", "Save image")}
        onClick={onSave}
      >
        <ArrowDownToLineIcon className="size-4" />
        {t("ダウンロード", "Download")}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className={buttonClassName}
            disabled={isSharing}
          >
            {isSharing ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <Share2Icon className="size-4" />
            )}
            {t("共有", "Share")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={onShareX}>
            {t("X でポスト", "Post on X")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void onCopyImage()}>
            <CopyIcon className="mr-2 size-4" />
            {t("画像をコピー", "Copy image")}
          </DropdownMenuItem>
          {canShareFiles && (
            <DropdownMenuItem onClick={() => void onShareFile()}>
              <Share2Icon className="mr-2 size-4" />
              {t("ほかのアプリで共有", "Share to other apps")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="sm"
        className={buttonClassName}
        title={t(
          "投稿サイトAipictorsに作品を投稿する",
          "Post this to Aipictors",
        )}
        onClick={onPost}
      >
        <FileUpIcon className="size-4" />
        {t("投稿", "Post")}
      </Button>

      {props.onReroll && (
        <Button
          variant="secondary"
          size="sm"
          className={buttonClassName}
          title={t(
            "同じ設定で Seed だけ変えて再生成します",
            "Generate again with the same settings and a new seed",
          )}
          onClick={onReroll}
        >
          <RotateCwIcon className="size-4" />
          {t("再生成", "Re-roll")}
        </Button>
      )}

      <GenerationReferenceDialog
        onReference={() => onRestore(false)}
        onReferenceWithSeed={() => onRestore(true)}
        isShowControlNetCaption={
          task.controlNetModule !== null && task.controlNetModule !== ""
        }
      >
        <Button
          variant="secondary"
          size="sm"
          className={buttonClassName}
          title={t("生成設定を再利用する", "Reuse generation parameters")}
        >
          <ArrowUpRightSquareIcon className="size-4" />
          {t("設定を再利用", "Reuse parameters")}
        </Button>
      </GenerationReferenceDialog>

      <Button
        variant="secondary"
        size="sm"
        className={cn(buttonClassName, rating > 0 && "text-yellow-500")}
        title={
          rating > 0
            ? t("お気に入りから外す", "Remove from favorites")
            : t("お気に入りに追加", "Add to favorites")
        }
        disabled={isRatingLoading}
        onClick={() => void onToggleFavorite()}
      >
        <StarIcon className={cn("size-4", rating > 0 && "fill-current")} />
        {t("お気に入り", "Favorite")}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={buttonClassName}
        title={t(
          "生成情報・保護・削除・AI修正など",
          "Details, protect, delete, AI modify",
        )}
        onClick={onOpenDetails}
      >
        <InfoIcon className="size-4" />
        {t("詳細", "Details")}
      </Button>
    </div>
  )
}

const GenerationCanvasActionsResultQuery = graphql(
  `query GenerationCanvasActionsResult($id: ID!) {
    imageGenerationResult(id: $id) {
      id
      nanoid
      prompt
      promptsText
      negativePrompt
      upscaleSize
      seed
      steps
      scale
      sampler
      scheduler
      clipSkip
      imageUrl
      sizeType
      width
      height
      vae
      controlNetModule
      controlNetWeight
      thumbnailUrl
      status
      completedAt
      rating
      isProtected
      model {
        id
        name
        type
      }
    }
  }`,
)

const GenerationCanvasActionsRatingMutation = graphql(
  `mutation GenerationCanvasActionsRating($input: UpdateRatingImageGenerationResultInput!) {
    updateRatingImageGenerationResult(input: $input) {
      id
      rating
    }
  }`,
)
