"use client"

import { StarRating } from "@/app/[lang]/generation/_components/star-rating"
import { GenerationMenuButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-menu-button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
  Pencil,
  Trash2,
} from "lucide-react"
import { CopyButton } from "./copy-button"

/**
 * 生成中の履歴詳細
 * @returns
 */
export const InProgressImageGenerationTaskResult = () => {
  return (
    <>
      <div className="px-4 py-4 w-full max-w-fit mx-auto">
        <p className="mb-1 font-semibold text-center">{"生成中"}</p>
        <Skeleton className="h-[400px] w-[400px] rounded-xl" />
        <div className="my-4 flex justify-end">
          <GenerationMenuButton
            title={"同じ情報で生成する"}
            onClick={() => {}}
            disabled={true}
            text={"参照生成"}
            icon={ArrowUpRightSquare}
          />
          <GenerationMenuButton
            title={"投稿する"}
            onClick={() => {}}
            disabled={true}
            text={"投稿"}
            icon={Pencil}
          />
          <GenerationMenuButton
            title={"生成情報をコピーする"}
            onClick={() => {}}
            disabled={true}
            icon={ClipboardCopy}
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
        <div className="mb-1">
          <p className="mb-1 font-semibold">{"Size"}</p>
          <Skeleton className="h-8 w-[196px]" />
        </div>
        <div className="py-2">
          <Separator />
        </div>
        <div className="mb-1">
          <p className="mb-1 font-semibold">{"Model"}</p>
          <Skeleton className="h-8 w-[196px]" />
        </div>
        <div className="py-2">
          <Separator />
        </div>
        <p className="mb-1 font-semibold">{"prompt"}</p>
        <Skeleton className="h-8 mb-2 w-[196px]" />
        <CopyButton className="mb-4" disabled={true} text={""} />
        <div className="py-2">
          <Separator />
        </div>
        <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
        <Skeleton className="h-8 mb-2 w-[196px]" />
        <CopyButton className="mb-4" disabled={true} text={""} />
        <div className="py-2">
          <Separator />
        </div>
        <div className="flex space-x-4">
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Seed"}</p>
            <Skeleton className="h-8 mb-2 w-[40px]" />
          </div>
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Sampler"}</p>
            <Skeleton className="h-8 mb-2 w-[40px]" />
          </div>
          <div className="w-full">
            <p className="mb-1 font-semibold">{"Scale"}</p>
            <Skeleton className="h-8 mb-2 w-[40px]" />
          </div>
        </div>
      </div>
    </>
  )
}
