"use client"

import { InPaintingDialog } from "@/app/[lang]/generation/_components/editor-submission-view/in-painting-dialog"
import { StarRating } from "@/app/[lang]/generation/_components/editor-task-view/star-rating"
import { GenerationImageDialogButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-image-dialog-button"
import { GenerationMenuButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-menu-button"
import type { GenerationParameters } from "@/app/[lang]/generation/tasks/[task]/_types/generation-parameters"
import type { GenerationSize } from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import { PrivateImage } from "@/app/_components/private-image"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { cn } from "@/lib/utils"
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
  GenerationParameters: GenerationParameters
  onReference(): void
  onPost(): void
  onDelete(): void
  onInPaint(): void
  onChangeRating(nanoid: string, rating: number): void
  setRating: (value: number) => void
  setShowInPaintDialog: (value: boolean) => void
  saveGenerationImage(taskId: string): void
  copyGeneration(generationParameters: GenerationParameters): void
  copyUrl(nanoid: string): void
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴内容
 * @param props
 * @returns
 */
export function GenerationTaskSheetViewContent(props: Props) {
  const imageListButton = () => {
    if (!props.isDisplayImageListButton) return null
    return (
      <Link href="/generation/tasks">
        <Button className="mt-16 mb-4 w-full p-4" variant={"secondary"}>
          画像一覧
        </Button>
      </Link>
    )
  }

  return (
    <>
      <ScrollArea className={cn({ "w-full mx-auto": props.isListFullSize })}>
        <div
          className={cn("space-y-2 p-4", {
            "w-full mx-auto": props.isListFullSize,
            "max-h-[88vh]": props.isScroll,
          })}
        >
          <GenerationImageDialogButton
            taskId={props.task.id}
            taskToken={props.task.token}
            children={
              <PrivateImage
                // biome-ignore lint/nursery/useSortedClasses: <explanation>
                className={`m-auto max-h-96 generation-image-${props.task.id}`}
                taskId={props.task.id}
                token={props.task.token as string}
                alt={"-"}
              />
            }
          />
          <div className="flex gap-x-2">
            <GenerationMenuButton
              title={"同じ情報で生成する"}
              onClick={props.onReference}
              text={"復元"}
              icon={ArrowUpRightSquare}
            />
            <GenerationMenuButton
              title={"投稿する"}
              onClick={props.onPost}
              text={"投稿"}
              icon={FileUp}
            />
            <GenerationMenuButton
              title={"生成情報をコピーする"}
              onClick={() => props.copyGeneration(props.GenerationParameters)}
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
              />
            </AppConfirmDialog>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="my-4 flex justify-end gap-x-2">
            <GenerationMenuButton
              title={"インペイント機能で一部分を再生成して修正する"}
              onClick={props.onInPaint}
              text={"部分修正"}
              icon={PenIcon}
            />
          </div>
          <StarRating
            value={props.rating ?? 0}
            onChange={(value) => {
              props.setRating(value)
              props.onChangeRating(props.task.nanoid ?? "", value)
            }}
          />
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1">
            <p className="mb-1 font-semibold">{"Size"}</p>
            <p>
              {props.generationSize.width}x{props.generationSize.height}
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
          <Textarea disabled={true} value={props.task.prompt} />
          <CopyButton className="mb-4" text={props.task.prompt} />
          <div className="py-2">
            <Separator />
          </div>
          <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
          <Textarea disabled={true} value={props.task.negativePrompt} />
          <CopyButton className="mb-4" text={props.task.negativePrompt} />
          <div className="py-2">
            <Separator />
          </div>
          <div className="mb-1">
            <p className="mb-1 font-semibold">{"Sampler"}</p>
            <p>{props.task.sampler}</p>
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <div className="flex space-x-4">
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Seed"}</p>
              <p>{props.task.seed}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"Scale"}</p>
              <p>{props.task.scale}</p>
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">{"ClipSkip"}</p>
              <p>{props.task.clipSkip}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
      {imageListButton()}
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
