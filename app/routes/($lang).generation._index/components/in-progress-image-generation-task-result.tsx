import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { GenerationMenuButton } from "~/routes/($lang).generation._index/components/generation-menu-button"
import {
  type GenerationSize,
  parseGenerationSize,
} from "~/routes/($lang).generation._index/types/generation-size"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
  FileUp,
  Trash2,
} from "lucide-react"
import { CopyButton } from "./copy-button"
import { StarRating } from "~/routes/($lang).generation._index/components/task-view/star-rating"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import type { FragmentOf } from "gql.tada"
import type { imageGenerationTaskFieldsFragment } from "~/graphql/fragments/image-generation-task-field"
import type { imageGenerationResultFieldsFragment } from "~/graphql/fragments/image-generation-result-field"

type Props = {
  task:
    | FragmentOf<typeof imageGenerationTaskFieldsFragment>
    | FragmentOf<typeof imageGenerationResultFieldsFragment>
    | undefined
}

/**
 * 生成中の履歴詳細
 */
export function InProgressImageGenerationTaskResult(props: Props) {
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

  const upscaleSize =
    props.task.upscaleSize !== null || props.task.upscaleSize
      ? props.task.upscaleSize
      : 1
  const width = generationSize.width * upscaleSize
  const height = generationSize.height * upscaleSize

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
            text={"再利用"}
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
              {width}x{height}
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
        <AutoResizeTextarea
          disabled={true}
          className="max-h-24 w-[100%] overflow-y-auto rounded-md border p-2 text-sm disabled:opacity-100"
        >
          {props.task.prompt}
        </AutoResizeTextarea>
        <CopyButton text={props.task.prompt} />
        <div className="py-2">
          <Separator />
        </div>
        <div>
          <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
        </div>
        <AutoResizeTextarea
          disabled={true}
          className="max-h-24 w-[100%] overflow-y-auto rounded-md border p-2 text-sm disabled:opacity-100"
        >
          {props.task.negativePrompt}
        </AutoResizeTextarea>
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
            <p className="mb-1 font-semibold">{"Steps"}</p>
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
