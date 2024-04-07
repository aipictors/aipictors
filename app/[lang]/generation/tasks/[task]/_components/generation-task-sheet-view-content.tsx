"use client"

import { InPaintingDialog } from "@/[lang]/generation/_components/submission-view/in-painting-dialog"
import { generationTaskError } from "@/[lang]/generation/_components/task-view/generation-task-error"
import { StarRating } from "@/[lang]/generation/_components/task-view/star-rating"
import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { GenerationImageDialogButton } from "@/[lang]/generation/tasks/[task]/_components/generation-image-dialog-button"
import { GenerationMenuButton } from "@/[lang]/generation/tasks/[task]/_components/generation-menu-button"
import { GenerationReferenceDialog } from "@/[lang]/generation/tasks/[task]/_components/generation-reference-dialog-button"
import { GenerationTaskContentImagePlaceHolder } from "@/[lang]/generation/tasks/[task]/_components/generation-task-content-image-place-holder"
import type { GenerationParameters } from "@/[lang]/generation/tasks/[task]/_types/generation-parameters"
import type { GenerationSize } from "@/[lang]/generation/tasks/[task]/_types/generation-size"
import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { PrivateImage } from "@/_components/private-image"
import SwipeArea from "@/_components/swipe-area"
import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { Separator } from "@/_components/ui/separator"
import { Skeleton } from "@/_components/ui/skeleton"
import type { ImageGenerationTaskFieldsFragment } from "@/_graphql/__generated__/graphql"
import { cn } from "@/_lib/utils"
import { ErrorBoundary } from "@sentry/react"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  FileUp,
  LinkIcon,
  LockKeyholeIcon,
  LockKeyholeOpenIcon,
  PenIcon,
  Trash2,
} from "lucide-react"
import { Suspense } from "react"
import { CopyButton } from "./copy-button"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  isScroll: boolean
  isDisplayImageListButton: boolean
  isListFullSize: boolean
  showInPaintDialog: boolean
  userNanoid: string
  generationSize: GenerationSize
  rating: number
  isProtected: boolean
  GenerationParameters: GenerationParameters
  isProtectedLoading: boolean
  isRatingLoading: boolean
  isDeletedLoading: boolean
  onReference(isSeedWith: boolean): void
  onPost(): void
  onDelete(): void
  onInPaint(): void
  onChangeRating(nanoid: string, rating: number): void
  onNextTask(): void
  onPrevTask(): void
  setRating: (value: number) => void
  setShowInPaintDialog: (value: boolean) => void
  saveGenerationImage(taskId: string): void
  toggleProtectedImage(taskId: string): void
  copyGeneration(generationParameters: GenerationParameters): void
  copyUrl(nanoid: string): void
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴内容
 * @param props
 * @returns
 */
export function GenerationTaskSheetViewContent(props: Props) {
  const context = useGenerationContext()

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

  return (
    <>
      <ScrollArea className={cn({ "mx-auto w-full": props.isListFullSize })}>
        <div
          className={cn("p-4", {
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
            <div className="relative bg-gray-100 dark:bg-gray-900">
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
                <>
                  <ErrorBoundary fallback={generationTaskError}>
                    <Suspense
                      fallback={
                        <GenerationTaskContentImagePlaceHolder
                          className={"m-auto h-72 max-h-96 max-w-['50vw']"}
                        />
                      }
                    >
                      <GenerationImageDialogButton
                        taskId={props.task.id}
                        taskToken={props.task.token}
                      >
                        <PrivateImage
                          className={"m-auto h-72 max-h-96"}
                          taskId={props.task.id}
                          token={props.task.token as string}
                          isThumbnail={
                            context.config.taskListThumbnailType === "light"
                          }
                          alt={"-"}
                        />
                      </GenerationImageDialogButton>
                    </Suspense>
                    {/* ダウンロード用（非表示） */}
                    <Suspense
                      fallback={
                        <GenerationTaskContentImagePlaceHolder
                          className={
                            "m-auto hidden h-72 max-h-96 max-w-['50vw']"
                          }
                        />
                      }
                    >
                      <PrivateImage
                        // biome-ignore lint/nursery/useSortedClasses: <explanation>
                        className={`m-auto h-72 hidden max-h-96 generation-image-${props.task.id}`}
                        taskId={props.task.id}
                        token={props.task.token as string}
                        isThumbnail={false}
                        alt={"-"}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </>
              ) : (
                <>
                  <p className="text-center">{"予約生成中"}</p>
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
                    title={"同じ情報で生成する"}
                    onClick={() => {}}
                    text={"復元"}
                    icon={ArrowUpRightSquare}
                  />
                </GenerationReferenceDialog>
                <GenerationMenuButton
                  title={"投稿する"}
                  onClick={props.onPost}
                  text={"投稿"}
                  icon={FileUp}
                />
                <GenerationMenuButton
                  title={"生成情報をコピーする"}
                  onClick={() =>
                    props.copyGeneration(props.GenerationParameters)
                  }
                  icon={ClipboardCopy}
                />
                {props.task.nanoid !== null && props.task.nanoid !== "" && (
                  <GenerationMenuButton
                    title={"URLをコピーする"}
                    onClick={() => {
                      if (props.task.nanoid !== null) {
                        props.copyUrl(props.task.nanoid)
                      }
                    }}
                    icon={LinkIcon}
                  />
                )}
                <GenerationMenuButton
                  title={"画像を保存する"}
                  onClick={() => props.saveGenerationImage(props.task.id)}
                  icon={ArrowDownToLine}
                />
                <GenerationMenuButton
                  title={"保護する"}
                  onClick={() => props.toggleProtectedImage(props.task.id)}
                  icon={
                    props.isProtected ? LockKeyholeIcon : LockKeyholeOpenIcon
                  }
                  isLoading={props.isProtectedLoading}
                />
                <AppConfirmDialog
                  title={"確認"}
                  description={"本当に削除しますか？"}
                  onNext={() => {
                    props.onDelete()
                  }}
                  onCancel={() => {}}
                >
                  <GenerationMenuButton
                    title={"生成履歴を削除する"}
                    onClick={() => () => {}}
                    icon={Trash2}
                    isLoading={props.isDeletedLoading}
                    disabled={props.isDeletedLoading}
                  />
                </AppConfirmDialog>
              </div>
              <div className="py-2">
                <Separator />
              </div>
              <div className="my-4 flex justify-end gap-x-2">
                <StarRating
                  value={props.rating}
                  onChange={(value) => {
                    props.setRating(value)
                    props.onChangeRating(props.task.nanoid ?? "", value)
                  }}
                  isLoading={props.isRatingLoading}
                />
                <div className="ml-auto">
                  <GenerationMenuButton
                    title={"インペイント機能で一部分を再生成して修正する"}
                    onClick={props.onInPaint}
                    text={"部分修正"}
                    icon={PenIcon}
                  />
                </div>
              </div>
              <div className="py-2">
                <Separator />
              </div>
            </>
          )}
          <div className="flex gap-x-2">
            <div className="basis-1/3 space-y-1">
              <p className="font-bold">{"Size"}</p>
              <p>
                {width}x{height}
              </p>
            </div>
            <div className="basis-1/3 space-y-1">
              <p className="font-bold">{"Model"}</p>
              <p>{extractStringBeforeComma(props.task.model?.name)}</p>
            </div>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="space-y-2">
            <p className="font-bold">{"prompt"}</p>
            <p className="max-h-24 overflow-y-auto rounded-md border p-2 text-sm">
              {props.task.prompt}
            </p>
            <CopyButton text={props.task.prompt} />
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="space-y-2">
            <p className="font-bold">{"NegativePrompt"}</p>
            <p className="max-h-24 overflow-y-auto rounded-md border p-2 text-sm">
              {props.task.negativePrompt}
            </p>
            <CopyButton text={props.task.negativePrompt} />
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1 flex space-x-4">
            <div className="w-full space-y-1">
              <p className="font-bold">{"Scale"}</p>
              <p>{props.task.scale}</p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{"Steps"}</p>
              <p>{props.task.steps}</p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{"Sampler"}</p>
              <p>{props.task.sampler}</p>
            </div>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="flex space-x-4">
            <div className="w-full space-y-1">
              <p className="font-bold">{"ClipSkip"}</p>
              <p>{props.task.clipSkip}</p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{"Vae"}</p>
              <p>
                {props.task.vae
                  ?.replace(".ckpt", "")
                  .replace(".safetensors", "") ?? ""}
              </p>
            </div>
            <div className="w-full space-y-1">
              <p className="font-bold">{"Seed"}</p>
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
                    <p className="font-bold">{"Module"}</p>
                    <p>{props.task.controlNetModule}</p>
                  </div>
                )}
                {props.task.controlNetWeight && (
                  <div className="w-full space-y-1">
                    <p className="font-bold">{"Weight"}</p>
                    <p>{props.task.controlNetWeight}</p>
                  </div>
                )}
                <div className="w-full space-y-1" />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      <InPaintingDialog
        isOpen={props.showInPaintDialog}
        onClose={() => props.setShowInPaintDialog(false)}
        taskId={props.task.id}
        token={props.task.token ?? ""}
        userNanoid={props.userNanoid}
        configSeed={props.task.seed}
        configSteps={props.task.steps}
        configSampler={props.task.sampler}
        configSizeType={props.task.sizeType}
        configModel={props.task.model?.name}
        configVae={props.task.vae}
        configScale={props.task.scale}
        configClipSkip={props.task.clipSkip}
      />
    </>
  )
}
