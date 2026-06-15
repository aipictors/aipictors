import { SelectableCardButton } from "~/components/selectable-card-button"
import { CoinIcon } from "~/components/coin-icon"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useMutation } from "@apollo/client/index"
import { useState } from "react"
import { toast } from "sonner"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { ReservedGenerationCard } from "~/routes/($lang).generation._index/components/reserved-generation-card"
import { InProgressGenerationCard } from "~/routes/($lang).generation._index/components/in-progress-generation-card"
import { GenerationTaskZoomUpButton } from "~/routes/($lang).generation._index/components/generation-task-zoom-up-button"
import { GenerationTaskRatingButton } from "~/routes/($lang).generation._index/components/generation-task-rating-button"
import { GenerationTaskDeleteButton } from "~/routes/($lang).generation._index/components/generation-task-delete-button"
import {
  GenerationResultProtectButtonFragment,
  GenerationResultProtectButtonTaskFragment,
} from "~/routes/($lang).generation._index/components/generation-task-protected-button"
import { graphql, type FragmentOf, type IntrospectionEnum } from "gql.tada"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"
import { cn } from "~/lib/utils"

const convertToGeminiImageSize = (sizeType: string) => {
  switch (sizeType) {
    case "SD1_512_512":
      return "SQUARE_512" as const
    case "SDXL_1024_1024":
      return "SQUARE_1024" as const
    case "SDXL_1024_768":
    case "SD1_768_512":
      return "LANDSCAPE" as const
    case "SDXL_768_1024":
    case "SD1_512_768":
      return "PORTRAIT" as const
    default:
      return "SQUARE_768" as const
  }
}

type Props = {
  taskId: string
  taskNanoid: string | null
  isSelected?: boolean
  estimatedSeconds?: number
  rating: number
  isProtected: boolean
  optionButtonSize: number
  isSelectDisabled: boolean
  task:
    | FragmentOf<typeof EditableGenerationResultCardFragment>
    | FragmentOf<typeof EditableGenerationResultCardTaskFragment>
  isPreviewByHover?: boolean
  userToken: string
  onClick?(): void
  onCancel?(): void
  onDelete?(taskId: string): void
}

/**
 * 画像生成の編集可能な履歴
 */
export function GenerationTaskEditableCard (props: Props) {
  const context = useGenerationContext()

  const data = useGenerationQuery()

  const [isHovered, setIsHovered] = useState(false)

  const [rating, setRating] = useState(props.rating)

  const [_isProtected, _setIsProtected] = useState(props.isProtected)

  const [cancelTask, { loading: isCanceling }] = useMutation(
    cancelImageGenerationTaskMutation,
  )

  const [cancelReservedTask, { loading: isCancelingReservedTask }] =
    useMutation(cancelImageGenerationReservedTaskMutation)

  const [deleteTask, { loading: isDeletedLoading }] = useMutation(
    deleteImageGenerationResultMutation,
  )

  const [createTask, { loading: isRetryingTask }] = useMutation(
    createImageGenerationTaskMutation,
  )

  const [createFluxTask, { loading: isRetryingFluxTask }] = useMutation(
    createFluxImageGenerationTaskMutation,
  )

  const [createGeminiTask, { loading: isRetryingGeminiTask }] = useMutation(
    createGeminiImageGenerationTaskMutation,
  )

  /**
   * 生成タスクをキャンセルする
   * @param taskNanoid
   * @returns
   */
  const onCancelTask = async (taskNanoid: string | null) => {
    if (taskNanoid === null) return
    try {
      await cancelTask({ variables: { input: { nanoid: taskNanoid } } })
      if (props.onCancel) {
        props.onCancel()
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("generation:task-requested"))
      }
      toast("タスクをキャンセルしました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const { send } = GenerationConfigContext.useActorRef()

  /**
   * 生成タスクを削除する
   */
  const onDeleteTask = async () => {
    if (props.taskNanoid === null) {
      toast("削除に失敗しました。")
      return
    }

    try {
      await deleteTask({
        variables: {
          input: {
            nanoid: props.taskNanoid,
          },
        },
      })
      toast("削除しました。")
      if (props.onDelete) {
        props.onDelete(props.taskNanoid)
      }
    } catch (_e) {
      toast("削除に失敗しました。")
    }
  }

  /**
   * 予約生成タスクをキャンセルする
   * @param taskNanoid
   * @returns
   */
  const onCancelReservedTask = async (taskNanoid: string | null) => {
    if (taskNanoid === null) return
    try {
      await cancelReservedTask({ variables: { input: { nanoid: taskNanoid } } })
      if (props.onCancel) {
        props.onCancel()
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("generation:task-requested"))
      }
      toast("予約タスクをキャンセルしました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onRetryTask = async () => {
    if (props.taskNanoid === null) {
      toast("リトライ対象が見つかりません。")
      return
    }

    try {
      const modelName = props.task.model.name
      const isFluxModel =
        modelName === "flux.1 schnell" || modelName === "flux.1 pro"
      const isGeminiModel =
        props.task.model.type === "GEMINI" ||
        props.task.model.type === "SD5" ||
        modelName === "Gemini 2.5" ||
        modelName === "Gemini 3.1"

      if (
        isGeminiModel &&
        props.task.generationType === "IMAGE_TO_IMAGE" &&
        !props.task.t2tImageUrl
      ) {
        toast("この履歴は参照画像付きリトライに未対応です。")
        return
      }

      if (isFluxModel) {
        await createFluxTask({
          variables: {
            input: {
              count: 1,
              prompt: props.task.prompt,
              negativePrompt: props.task.negativePrompt,
              seed: props.task.seed,
              steps: props.task.steps,
              scale: props.task.scale,
              sizeType:
                props.task.sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
              modelName,
              retryFromNanoid: props.taskNanoid,
            },
          },
        })
      } else if (isGeminiModel) {
        await createGeminiTask({
          variables: {
            input: {
              prompt: props.task.prompt,
              size: convertToGeminiImageSize(props.task.sizeType),
              imageUrl: props.task.t2tImageUrl || null,
              model:
                modelName.toLowerCase().includes("3.1") ||
                modelName.toLowerCase().includes("nanobanana2") ||
                modelName.toLowerCase().includes("nano banana 2") ||
                modelName === "GeminiNanoBanana2" ||
                modelName === "gemini-3.1-flash-image-preview"
                  ? "GEMINI_31_FLASH_IMAGE_PREVIEW"
                  : "GEMINI_25_FLASH_IMAGE",
              retryFromNanoid: props.taskNanoid,
            },
          },
        })
      } else {
        await createTask({
          variables: {
            input: {
              count: 1,
              model: modelName,
              vae: props.task.vae ?? "",
              prompt: props.task.prompt,
              negativePrompt: props.task.negativePrompt,
              seed: props.task.seed,
              steps: props.task.steps,
              scale: props.task.scale,
              sampler: props.task.sampler,
              clipSkip: props.task.clipSkip,
              sizeType:
                props.task.sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
              type:
                props.task.generationType as IntrospectionEnum<"ImageGenerationType">,
              t2tImageUrl: props.task.t2tImageUrl || null,
              t2tMaskImageUrl: props.task.t2tMaskImageUrl || null,
              t2tDenoisingStrengthSize:
                props.task.t2tDenoisingStrengthSize || null,
              t2tInpaintingFillSize:
                props.task.t2tInpaintingFillSize || null,
              controlNetWeight: props.task.controlNetWeight ?? null,
              controlNetModel: props.task.controlNetModel || null,
              controlNetModule: props.task.controlNetModule || null,
              upscaleSize: props.task.upscaleSize,
              retryFromNanoid: props.taskNanoid,
            },
          },
        })
      }

      toast("リトライをリクエストしました")

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("generation:task-requested"))
      }
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      } else {
        toast("リトライに失敗しました。")
      }
    }
  }

  /**
   * 履歴画像上に表示されるボタンのサイズ
   * @param size サイズ
   * @returns
   */
  const optionButtonSize = (size: number) => {
    if (size < 3) {
      return 1
    }
    if (size < 5) {
      return 2
    }
    return 3
  }

  if (props.task.status === "RESERVED") {
    return (
      <ReservedGenerationCard
        onClick={props.onClick}
        onCancel={() => onCancelReservedTask(props.task.nanoid)}
        isCanceling={isCanceling}
        taskId={props.taskId}
        isPreviewByHover={props.isPreviewByHover}
        setIsHovered={setIsHovered}
      />
    )
  }

  if (
    !props.task.imageUrl &&
    (props.task.status === "PENDING" || props.task.status === "IN_PROGRESS")
  ) {
    return (
      <InProgressGenerationCard
        onCancel={() => onCancelTask(props.taskNanoid)}
        isCanceling={isCanceling}
        inProgressNormalCount={
          data.engineStatus?.normalPredictionGenerationWait ?? 0
        }
        initImageGenerationWaitCount={
          data.userStatus?.imageGenerationWaitCount ?? 0
        }
        imageGenerationWaitCount={
          data.userStatus?.imageGenerationWaitCount ?? 0
        }
      />
    )
  }

  if (!props.task.imageUrl && props.task.status === "ERROR") {
    const isRetrying =
      isRetryingTask || isRetryingFluxTask || isRetryingGeminiTask

    return (
      <div className="grid h-full overflow-hidden rounded-xl border border-destructive/30 bg-card">
        <SelectableCardButton
          onClick={props.onClick}
          isSelected={props.isSelected}
          isDisabled={props.isSelectDisabled}
        >
          <div className="flex h-full min-h-[120px] flex-col justify-between gap-3 p-4 text-left">
            <div className="space-y-2">
              <div className="inline-flex w-fit rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                生成失敗
              </div>
              <p className="text-sm font-semibold text-foreground">
                画像の生成に失敗しました
              </p>
              <p className="text-xs text-muted-foreground">
                コイン消費なしで同じ条件の再リクエストができます。
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CoinIcon className="h-4 w-4 shrink-0" />
              <span>0</span>
            </div>
          </div>
        </SelectableCardButton>
        <div className="flex items-center justify-between gap-2 border-t bg-muted/20 px-4 py-3">
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={onRetryTask}
            disabled={isRetrying}
          >
            <CoinIcon className="h-4 w-4 shrink-0" />
            <span>{isRetrying ? "リトライ中..." : "0でリトライ"}</span>
          </Button>
          {props.isSelectDisabled && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDeleteTask}
              disabled={isDeletedLoading}
            >
              削除
            </Button>
          )}
        </div>
      </div>
    )
  }

  const originalImageUrl = props.task.imageUrl
  const originalThumbnailUrl = props.task.thumbnailUrl ?? ""

  const normalizedImageUrl = normalizeGenerativeFileUrl(originalImageUrl)
  const normalizedThumbnailUrl = originalThumbnailUrl
    ? normalizeGenerativeFileUrl(originalThumbnailUrl)
    : originalThumbnailUrl

  return (
    <div
      className="relative grid h-full overflow-hidden rounded bg-card p-0"
      onMouseEnter={() => {
        if (props.isPreviewByHover) {
          context.updatePreviewTaskId(props.task.id)
          send({ type: "OPEN_HISTORY_PREVIEW" })
        }
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        context.updatePreviewTaskId(null)
        send({ type: "CLOSE" })
        setIsHovered(false)
      }}
    >
      <SelectableCardButton
        onClick={props.onClick}
        isSelected={props.isSelected}
        isDisabled={props.isSelectDisabled}
      >
        {props.task.imageUrl !== "" &&
        props.task.thumbnailUrl !== "" &&
        props.task.thumbnailUrl !== null ? (
          <img
            className={cn(`generation-image-${props.taskNanoid}`, "m-auto")}
            src={
              context.config.taskListThumbnailType === "light"
                ? normalizedThumbnailUrl
                : normalizedImageUrl
            }
            data-original={normalizedImageUrl}
            data-original-raw={originalImageUrl}
            data-generative-raw={
              context.config.taskListThumbnailType === "light"
                ? originalThumbnailUrl
                : originalImageUrl
            }
            onError={(event) => {
              const img = event.currentTarget
              const raw = img.dataset.generativeRaw
              if (!raw) return
              if (img.dataset.generativeFallback === "true") {
                return
              }
              img.dataset.generativeFallback = "true"
              img.src = raw

              // If we fell back for display, also prefer raw for download.
              const downloadRaw = img.dataset.originalRaw
              if (downloadRaw) {
                img.dataset.original = downloadRaw
              }
            }}
            alt={"-"}
          />
        ) : (
          <Skeleton className="h-[120px] w-[240px] rounded-xl" />
        )}
      </SelectableCardButton>
      {/* 拡大ボタン */}
      {isHovered && props.task.imageUrl && props.task.thumbnailUrl && (
        <GenerationTaskZoomUpButton
          taskId={props.taskId}
          token={props.userToken}
          size={optionButtonSize(props.optionButtonSize)}
          setIsHovered={setIsHovered}
          imageUrl={originalImageUrl}
          thumbnailUrl={originalThumbnailUrl}
        />
      )}
      {/* お気に入りボタン */}
      {(isHovered || rating !== 0) && props.taskNanoid && (
        <GenerationTaskRatingButton
          nowRating={rating}
          taskNanoid={props.taskNanoid}
          size={optionButtonSize(props.optionButtonSize)}
          onRatingChange={(newRating) => {
            setRating(newRating)
          }}
        />
      )}
      {/* 削除ボタン */}
      {isHovered && props.isSelectDisabled && (
        <GenerationTaskDeleteButton
          onDelete={onDeleteTask}
          isDeletedLoading={isDeletedLoading}
        />
      )}
      {/* 保護ボタン */}
      {/* {(isHovered || isProtected) && props.taskNanoid && (
        <GenerationTaskProtectedButton
          isProtected={isProtected}
          taskNanoid={props.taskNanoid}
          size={optionButtonSize(props.optionButtonSize)}
          onProtectedChange={(isProtected) => {
            setIsProtected(isProtected)
          }}
        />
      )} */}
    </div>
  )
}

export const EditableGenerationResultCardFragment = graphql(
  `fragment EditableGenerationResultCard on ImageGenerationResultNode @_unmask {
    id
    nanoid
    status
    imageUrl
    thumbnailUrl
    estimatedSeconds
    rating
    prompt
    negativePrompt
    scale
    steps
    sampler
    seed
    clipSkip
    sizeType
    generationType
    t2tImageUrl
    t2tMaskImageUrl
    t2tDenoisingStrengthSize
    t2tInpaintingFillSize
    controlNetWeight
    controlNetModule
    controlNetModel
    upscaleSize
    vae
    model {
      id
      name
      type
    }
    ...GenerationResultProtectButton
  }`,
  [GenerationResultProtectButtonFragment],
)

export const EditableGenerationResultCardTaskFragment = graphql(
  `fragment EditableGenerationResultCardTask on ImageGenerationTaskNode @_unmask {
    id
    nanoid
    status
    imageUrl
    thumbnailUrl
    estimatedSeconds
    rating
    prompt
    negativePrompt
    scale
    steps
    sampler
    seed
    clipSkip
    sizeType
    generationType
    t2tImageUrl
    t2tMaskImageUrl
    t2tDenoisingStrengthSize
    t2tInpaintingFillSize
    controlNetWeight
    controlNetModule
    controlNetModel
    upscaleSize
    vae
    model {
      id
      name
      type
    }
    ...GenerationResultProtectButtonTask
  }`,
  [GenerationResultProtectButtonTaskFragment],
)

const createImageGenerationTaskMutation = graphql(
  `mutation RetryCreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      id
    }
  }`,
)

const createFluxImageGenerationTaskMutation = graphql(
  `mutation RetryCreateFluxImageGenerationTask($input: CreateFluxImageGenerationTaskInput!) {
    createFluxImageGenerationTask(input: $input) {
      id
    }
  }`,
)

const createGeminiImageGenerationTaskMutation = graphql(
  `mutation RetryCreateGeminiImageGenerationTask($input: CreateGeminiImageGenerationTaskInput!) {
    createGeminiImageGenerationTask(input: $input) {
      id
    }
  }`,
)

const cancelImageGenerationReservedTaskMutation = graphql(
  `mutation CancelImageGenerationReservedTask($input: CancelImageGenerationReservedTaskInput!) {
    cancelImageGenerationReservedTask(input: $input) {
      ...EditableGenerationResultCardTask
    }
  }`,
  [EditableGenerationResultCardTaskFragment],
)

const cancelImageGenerationTaskMutation = graphql(
  `mutation CancelImageGenerationTask($input: CancelImageGenerationTaskInput!) {
    cancelImageGenerationTask(input: $input) {
      ...EditableGenerationResultCardTask
    }
  }`,
  [EditableGenerationResultCardTaskFragment],
)

const deleteImageGenerationResultMutation = graphql(
  `mutation deleteImageGenerationResult($input: DeleteImageGenerationResultInput!) {
    deleteImageGenerationResult(input: $input) {
      ...EditableGenerationResultCard
    }
  }`,
  [EditableGenerationResultCardFragment],
)
