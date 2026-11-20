import { type FragmentOf, graphql } from "gql.tada"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  LockKeyholeIcon,
  LockKeyholeOpenIcon,
  PenIcon,
  RotateCw,
  StarIcon,
} from "lucide-react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { SwipeArea } from "~/components/swipe-area"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { CopyButton } from "~/routes/($lang).generation._index/components/copy-button"
import { GenerationImageDialogButton } from "~/routes/($lang).generation._index/components/generation-image-dialog-button"
import { GenerationMenuButton } from "~/routes/($lang).generation._index/components/generation-menu-button"
import { GenerationReferenceDialog } from "~/routes/($lang).generation._index/components/generation-reference-dialog-button"
import { GenerationTaskContentImagePlaceHolder } from "~/routes/($lang).generation._index/components/generation-task-content-image-place-holder"
import { GenerationTaskDeleteMemoConfirmDialog } from "~/routes/($lang).generation._index/components/generation-task-delete-memo-confirm-dialog"
import { GenerationTaskPostConfirmDialog } from "~/routes/($lang).generation._index/components/generation-task-post-confirm-dialog"
import { GeminiImageModificationDialog } from "~/routes/($lang).generation._index/components/submission-view/gemini-image-modification-dialog"
import { GenerationTaskError } from "~/routes/($lang).generation._index/components/task-view/generation-task-error"
import { StarRating } from "~/routes/($lang).generation._index/components/task-view/star-rating"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import type { GenerationParameters } from "~/routes/($lang).generation._index/types/generation-parameters"
import type { GenerationSize } from "~/routes/($lang).generation._index/types/generation-size"
import { toPngParametersText } from "~/routes/($lang).generation._index/utils/png-generation-parameters"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  task:
    | FragmentOf<typeof GenerationImageResultSheetContentFragment>
    | FragmentOf<typeof GenerationImageResultSheetContentTaskFragment>
  isScroll: boolean
  isDisplayImageListButton: boolean
  isListFullSize: boolean
  showAiModificationDialog: boolean
  userNanoid: string
  generationSize: GenerationSize
  rating: number
  isProtected: boolean
  GenerationParameters: GenerationParameters
  isProtectedLoading: boolean
  isRatingLoading: boolean
  isDeletedLoading: boolean
  onReference(isSeedWith: boolean): void
  onReroll?: () => void
  onPost(): void
  onDelete(): void
  onInPaint(): void
  onChangeRating(nanoid: string, rating: number): void
  onNextTask(): void
  onPrevTask(): void
  setRating: (value: number) => void
  setShowAiModificationDialog: (value: boolean) => void
  saveGenerationImage(taskId: string, imageUrl: string): void
  toggleProtectedImage(taskId: string): void
  copyGeneration(generationParameters: GenerationParameters): void
  copyUrl(nanoid: string): void
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴内容
 */
export function GenerationTaskSheetViewContent(props: Props) {
  const context = useGenerationContext()
  const t = useTranslation()

  const originalImageUrl = props.task.imageUrl ?? ""
  const originalThumbnailUrl = props.task.thumbnailUrl ?? ""

  const normalizedImageUrl = originalImageUrl
    ? normalizeGenerativeFileUrl(originalImageUrl)
    : originalImageUrl
  const normalizedThumbnailUrl = originalThumbnailUrl
    ? normalizeGenerativeFileUrl(originalThumbnailUrl)
    : originalThumbnailUrl

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
   * 次のタスクに戻れるか
   * @returns
   */
  const canNextTask = (): boolean => {
    const nowTask = props.task.id
    const taskIds = context.config.viewTaskIds
    if (nowTask === null || taskIds === null) return false
    const index = taskIds.indexOf(nowTask)
    if (!taskIds.length || taskIds.length === index + 1) {
      return false
    }
    return true
  }

  /**
   * 前のタスクに戻れるか
   * @returns
   */
  const canPrevTask = (): boolean => {
    const nowTask = props.task.id
    const taskIds = context.config.viewTaskIds
    if (nowTask === null || taskIds === null) return false
    const index = taskIds.indexOf(nowTask)
    if (!taskIds.length || index === 0) {
      return false
    }
    return true
  }

  const upscaleSize =
    props.task.upscaleSize !== null || props.task.upscaleSize
      ? props.task.upscaleSize
      : 1
  const width = props.generationSize.width * upscaleSize

  const height = props.generationSize.height * upscaleSize

  const userToken = context.config.currentUserToken

  return (
    <>
      <ScrollArea className={cn("mx-auto h-full w-full", "md:h-full")}>
        <div
          className={cn("h-full min-h-0 px-4 pt-4 pb-0", {
            "mx-auto w-full": props.isListFullSize,
            "max-h-[88vh]": props.isScroll,
          })}
        >
          <SwipeArea
            onNext={() => {
              props.onNextTask()
            }}
            onPrev={() => {
              props.onPrevTask()
            }}
          >
            <div
              className="!h-full relative flex max-h-full min-h-0 items-center justify-center overflow-hidden rounded-xl bg-background px-3 pt-3 pb-0"
              style={{ height: "100%" }}
            >
              {/* 前ボタン */}
              {canPrevTask() && (
                <Button
                  className="absolute top-[50%] left-8"
                  variant={"ghost"}
                  size={"icon"}
                  onClick={props.onPrevTask}
                >
                  <ChevronLeft className="w-8" />
                </Button>
              )}
              {props.task.status !== "RESERVED" ? (
                <ErrorBoundary fallback={<GenerationTaskError />}>
                  <Suspense
                    fallback={
                      <GenerationTaskContentImagePlaceHolder
                        className={"m-auto h-full w-full max-w-['50vw']"}
                      />
                    }
                  >
                    {props.task.imageUrl &&
                    props.task.thumbnailUrl &&
                    userToken ? (
                      <GenerationImageDialogButton
                        taskId={props.task.id}
                        userToken={userToken}
                        imageUrl={originalImageUrl}
                        thumbnailUrl={originalThumbnailUrl}
                      >
                        <img
                          className={"h-full w-full object-contain"}
                          src={
                            context.config.taskListThumbnailType === "light"
                              ? normalizedThumbnailUrl
                              : normalizedImageUrl
                          }
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

                            // Download should also use the fallback URL.
                            const downloadTarget =
                              document.querySelector<HTMLImageElement>(
                                `.generation-image-${props.task.id}`,
                              )
                            if (downloadTarget) {
                              downloadTarget.dataset.generativeFallback = "true"
                              const downloadRaw =
                                downloadTarget.dataset.originalRaw ??
                                originalImageUrl
                              if (downloadRaw) {
                                downloadTarget.dataset.original = downloadRaw
                                downloadTarget.src = downloadRaw
                              }
                            }
                          }}
                          alt={"-"}
                        />
                      </GenerationImageDialogButton>
                    ) : null}
                  </Suspense>
                  {/* ダウンロード用（非表示） */}
                  <Suspense
                    fallback={
                      <GenerationTaskContentImagePlaceHolder
                        className={
                          "m-auto hidden h-full max-w-['50vw'] object-contain"
                        }
                      />
                    }
                  >
                    {userToken &&
                      props.task.imageUrl &&
                      props.task.thumbnailUrl && (
                        <img
                          className={cn(
                            "m-auto hidden h-full max-h-none w-full object-contain",
                            `generation-image-${props.task.id}`,
                          )}
                          alt={"-"}
                          src={normalizedImageUrl}
                          data-original={normalizedImageUrl}
                          data-original-raw={originalImageUrl}
                          data-generation-parameters={toPngParametersText(
                            props.task,
                          )}
                          onError={(event) => {
                            const img = event.currentTarget
                            const raw = img.dataset.originalRaw
                            if (!raw) return
                            if (img.dataset.generativeFallback === "true") {
                              return
                            }
                            img.dataset.generativeFallback = "true"
                            img.src = raw
                            img.dataset.original = raw
                          }}
                        />
                      )}
                  </Suspense>
                </ErrorBoundary>
              ) : (
                <>
                  <p className="text-center">
                    {t("予約生成中", "Generating...")}
                  </p>
                  <div className="relative bg-gray-100 p-8 dark:bg-gray-900">
                    <Skeleton
                      className={"m-auto h-[400px] w-[400px] rounded-xl"}
                    />
                  </div>
                </>
              )}
              {/* 次ボタン */}
              {canNextTask() && (
                <Button
                  className="absolute top-[50%] right-8"
                  variant={"ghost"}
                  size={"icon"}
                  onClick={props.onNextTask}
                >
                  <ChevronRight className="w-8" />
                </Button>
              )}
            </div>
          </SwipeArea>
          {props.task.status !== "RESERVED" && (
            <>
              <div className="flex flex-wrap gap-x-2 gap-y-2 pt-2">
                <GenerationMenuButton
                  title={
                    props.rating > 0
                      ? t("お気に入りから外す", "Remove from favorites")
                      : t("お気に入りに追加", "Add to favorites")
                  }
                  onClick={() => {
                    const rating = props.rating > 0 ? 0 : 1
                    props.setRating(rating)
                    props.onChangeRating(props.task.nanoid ?? "", rating)
                  }}
                  text={t("お気に入り", "Favorite")}
                  icon={StarIcon}
                  isLoading={props.isRatingLoading}
                  className={props.rating > 0 ? "text-yellow-500" : undefined}
                />
                <GenerationTaskPostConfirmDialog onPost={props.onPost} />
                {props.onReroll && (
                  <GenerationMenuButton
                    title={t(
                      "同じ設定で Seed だけ変えて再生成します",
                      "Generate again with the same settings and a new seed",
                    )}
                    onClick={props.onReroll}
                    text={t("再生成", "Re-roll")}
                    icon={RotateCw}
                  />
                )}
                <GenerationReferenceDialog
                  onReference={() => {
                    props.onReference(false)
                  }}
                  onReferenceWithSeed={() => {
                    props.onReference(true)
                  }}
                  isShowControlNetCaption={
                    props.task.controlNetModule !== null &&
                    props.task.controlNetModule !== ""
                  }
                >
                  <GenerationMenuButton
                    title={t(
                      "生成設定を再利用する",
                      "Reuse generation parameters",
                    )}
                    onClick={() => {}}
                    text={t("設定を再利用", "Reuse parameters")}
                    icon={ArrowUpRightSquare}
                  />
                </GenerationReferenceDialog>
                <GenerationTaskDeleteMemoConfirmDialog
                  onDelete={props.onDelete}
                  isDeletedLoading={props.isDeletedLoading}
                />
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-2 pt-2">
                <GenerationMenuButton
                  title={t("生成情報をコピーする", "Copy generation info")}
                  onClick={() =>
                    props.copyGeneration(props.GenerationParameters)
                  }
                  text={t("コピー", "Copy")}
                  icon={ClipboardCopy}
                />
                {props.task?.imageUrl && (
                  <GenerationMenuButton
                    title={t("画像を保存する", "Save image")}
                    onClick={() =>
                      userToken &&
                      props.saveGenerationImage(
                        props.task.id,
                        props.task.imageUrl ?? "",
                      )
                    }
                    text={t("保存", "Save")}
                    icon={ArrowDownToLine}
                  />
                )}
                <GenerationMenuButton
                  title={t("保護する", "Protect image")}
                  onClick={() => props.toggleProtectedImage(props.task.id)}
                  text={t("保護", "Protect")}
                  icon={
                    props.isProtected ? LockKeyholeIcon : LockKeyholeOpenIcon
                  }
                  isLoading={props.isProtectedLoading}
                />
              </div>
              <div className="py-2">
                <Separator />
              </div>
              <div className="my-4 flex justify-end gap-x-2">
                <StarRating
                  title={t("お気に入りの星で評価する", "Rate with stars")}
                  value={props.rating}
                  onChange={(value) => {
                    props.setRating(value)
                    props.onChangeRating(props.task.nanoid ?? "", value)
                  }}
                  isLoading={props.isRatingLoading}
                />
                <div className="ml-auto flex flex-col items-end gap-1">
                  <GenerationMenuButton
                    title={t(
                      "AIで画像を修正(50コイン消費)する",
                      "Modify image with AI",
                    )}
                    onClick={props.onInPaint}
                    text={t("AI修正", "AI Modify")}
                    icon={PenIcon}
                  />
                  {/* 手や指の崩れなど、部分的に直す機能があることが伝わっていなかった（ご利用アンケート） */}
                  <p className="text-right text-muted-foreground text-xs">
                    {t(
                      "手や指など、気になるところだけ描き直せます",
                      "Redraw just the part you want, like hands",
                    )}
                  </p>
                </div>
              </div>
              <div className="py-2">
                <Separator />
              </div>
            </>
          )}
          <div className="flex gap-x-2">
            <div className="basis-1/3 space-y-1">
              <p className="font-bold">{t("Size", "Size")}</p>
              <p>
                {width}x{height}
              </p>
            </div>
            <div className="basis-1/3 space-y-1">
              <p className="font-bold">{t("Model", "Model")}</p>
              <p>{extractStringBeforeComma(props.task.model?.name)}</p>
            </div>
          </div>
          <div className="py-0">
            <Separator />
          </div>
          <div className="space-y-2">
            <p className="font-bold">{t("prompt", "Prompt")}</p>
            <AutoResizeTextarea
              disabled={true}
              className="max-h-24 w-[100%] overflow-y-auto rounded-md border p-2 text-sm disabled:opacity-100"
            >
              {props.task.prompt}
            </AutoResizeTextarea>
            <CopyButton text={props.task.prompt} />
          </div>
          <div className="py-2">
            <Separator />
          </div>
          {props.task.promptsText && (
            <>
              <div className="space-y-2">
                <p className="font-bold">{t("元の文章", "Original Text")}</p>
                <AutoResizeTextarea
                  disabled={true}
                  className="max-h-24 w-[100%] overflow-y-auto rounded-md border p-2 text-sm disabled:opacity-100"
                >
                  {props.task.promptsText}
                </AutoResizeTextarea>
                <CopyButton text={props.task.promptsText} />
              </div>
              <div className="py-2">
                <Separator />
              </div>
            </>
          )}
          <div className="space-y-2">
            <p className="font-bold">
              {t("NegativePrompt", "Negative Prompt")}
            </p>
            <AutoResizeTextarea
              disabled={true}
              className="max-h-24 w-[100%] overflow-y-auto rounded-md border p-2 text-sm disabled:opacity-100"
            >
              {props.task.negativePrompt}
            </AutoResizeTextarea>

            <CopyButton text={props.task.negativePrompt} />
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1 flex space-x-4">
            <div className="w-full space-y-1">
              <p className="font-bold">{t("Scale", "Scale")}</p>
              <p>{props.task.scale}</p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{t("Steps", "Steps")}</p>
              <p>{props.task.steps}</p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{t("Sampler", "Sampler")}</p>
              <p>{props.task.sampler}</p>
            </div>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="flex space-x-4">
            <div className="w-full space-y-1">
              <p className="font-bold">{t("ClipSkip", "ClipSkip")}</p>
              <p>{props.task.clipSkip}</p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{t("Vae", "VAE")}</p>
              <p>
                {props.task.vae
                  ?.replace(".ckpt", "")
                  .replace(".safetensors", "") ?? ""}
              </p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{t("Seed", "Seed")}</p>
              <p>{props.task.seed}</p>
            </div>
          </div>
          {(props.task.controlNetModule || props.task.controlNetWeight) && (
            <>
              <div className="py-2">
                <Separator />
              </div>
              <div className="flex space-x-4">
                {props.task.controlNetModule && (
                  <div className="w-full space-y-1">
                    <p className="font-bold">{t("Module", "Module")}</p>
                    <p>{props.task.controlNetModule}</p>
                  </div>
                )}
                {props.task.controlNetWeight && (
                  <div className="w-full space-y-1">
                    <p className="font-bold">{t("Weight", "Weight")}</p>
                    <p>{props.task.controlNetWeight}</p>
                  </div>
                )}
                <div className="w-full space-y-1" />
              </div>
            </>
          )}
          <div className="py-2">
            <Separator />
          </div>
          {props.task.completedAt && (
            <div className="w-full space-y-1">
              <p className="font-bold">{t("生成日時", "Generation Date")}</p>
              <p>{toDateTimeText(props.task.completedAt)}</p>
            </div>
          )}
        </div>
      </ScrollArea>
      {props.task.imageUrl && userToken && (
        <GeminiImageModificationDialog
          isOpen={props.showAiModificationDialog}
          onClose={() => props.setShowAiModificationDialog(false)}
          taskId={props.task.id}
          token={userToken}
          imageUrl={normalizeGenerativeFileUrl(props.task.imageUrl)}
          userNanoid={props.userNanoid}
          originalPrompt={props.task.prompt || ""}
        />
      )}
    </>
  )
}

export const GenerationImageResultSheetContentFragment = graphql(
  `fragment GenerationImageResultSheetContent on ImageGenerationResultNode @_unmask {
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
    }
  }`,
)

export const GenerationImageResultSheetContentTaskFragment = graphql(
  `fragment GenerationImageResultSheetContentTask on ImageGenerationTaskNode @_unmask {
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
    }
  }`,
)
