"use client"

import { StarRating } from "@/app/[lang]/generation/_components/task-view/star-rating"
import { GenerationMenuButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-menu-button"
import {
  type GenerationSize,
  parseGenerationSize,
} from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import type {
  ImageGenerationTaskFieldsFragment,
  ImageGenerationTaskNode,
} from "@/graphql/__generated__/graphql"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
  FileUp,
  LinkIcon,
  Trash2,
} from "lucide-react"
import { CopyButton } from "./copy-button"

type Props = {
  task: ImageGenerationTaskFieldsFragment | undefined
}

/**
 * 生成中の履歴詳細
 * @returns
 */
export const InProgressImageGenerationTaskResult = (props: Props) => {
  if (props.task === undefined) return null

  const generationSize: GenerationSize = parseGenerationSize(
    props.task.sizeType,
  )

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

  return (
    <>
      <div className="mx-auto w-full max-w-fit p-4">
        {props.task.status === "RESERVED" ? (
          <p className="mb-1 text-center font-semibold">{"予約生成中"}</p>
        ) : (
          <p className="mb-1 text-center font-semibold">{"生成中"}</p>
        )}
        <Skeleton className="m-auto h-[400px] w-[400px] rounded-xl" />
        <div className="my-4 flex justify-end gap-x-2">
          <GenerationMenuButton
            title={"同じ情報で生成する"}
            onClick={() => {}}
            disabled={true}
            text={"復元"}
            icon={ArrowUpRightSquare}
          />
          <GenerationMenuButton
            title={"投稿する"}
            onClick={() => {}}
            disabled={true}
            text={"投稿"}
            icon={FileUp}
          />
          <GenerationMenuButton
            title={"生成情報をコピーする"}
            onClick={() => {}}
            disabled={true}
            icon={ClipboardCopy}
          />
          <GenerationMenuButton
            title={"URLをコピーする"}
            onClick={() => {}}
            disabled={true}
            icon={LinkIcon}
          />
          <GenerationMenuButton
            title={"画像を保存する"}
            onClick={() => {}}
            disabled={true}
            icon={ArrowDownToLine}
          />
          <GenerationMenuButton
            title={"生成履歴を削除する"}
            onClick={() => {}}
            disabled={true}
            icon={Trash2}
          />
        </div>
        <StarRating value={0} disabled={true} onChange={() => {}} />
        <div className="py-2">
          <Separator />
        </div>
        <div className="mb-1 flex gap-x-2">
          <div className="basis-1/3">
            <p className="mb-1 font-semibold">{"Size"}</p>
            <p>
              {generationSize.width}x{generationSize.height}
            </p>
          </div>
          <div className="basis-1/3">
            <p className="mb-1 font-semibold">{"Model"}</p>
            <p>{extractStringBeforeComma(props.task.model?.name)}</p>
          </div>
        </div>
        <div className="py-2">
          <Separator />
        </div>
        <p className="mb-1 font-semibold">{"prompt"}</p>
        <p className="max-h-24 overflow-y-auto rounded-md border p-2 text-sm">
          {props.task.prompt}
        </p>
        <CopyButton text={props.task.prompt} />
        <div className="py-2">
          <Separator />
        </div>
        <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
        <p className="max-h-24 overflow-y-auto rounded-md border p-2 text-sm">
          {props.task.negativePrompt}
        </p>
        <CopyButton text={props.task.negativePrompt} />
        <div className="py-2">
          <Separator />
        </div>
        <div className="mb-1 flex space-x-4">
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Scale"}</p>
            <p>{props.task.scale}</p>
          </div>
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Scale"}</p>
            <p>{props.task.steps}</p>
          </div>
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Sampler"}</p>
            <p>{props.task.sampler}</p>
          </div>
        </div>
        <div className="py-2">
          <Separator />
        </div>
        <div className="flex space-x-4">
          <div className="w-full">
            <p className="mb-1 font-semibold">{"ClipSkip"}</p>
            <p>{props.task.clipSkip}</p>
          </div>
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Vae"}</p>
            <p>
              {props.task.vae?.replace(".ckpt", "").replace(".safetensors", "")}
            </p>
          </div>
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Seed"}</p>
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
    </>
  )
}
