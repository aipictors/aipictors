"use client"

import { GenerationConfigMemoUpdateParts } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-update-parts"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"
import { toast } from "sonner"

type Props = {
  memo: ImageGenerationMemoNode
  refetchMemos: () => void
}

/**
 * 履歴メモ単体
 * @param props
 * @returns
 */
export const GenerationConfigMemoItem = (props: Props) => {
  if (props.memo === undefined) return null

  const context = useGenerationContext()

  /**
   * リストア
   */
  const onRestore = () => {
    const modelId =
      props.memo.model.id === "0" ? context.config.modelId : props.memo.model.id
    const promptText =
      props.memo.prompts === "" ? context.config.promptText : props.memo.prompts
    const negativePromptText =
      props.memo.negativePrompts === ""
        ? context.config.negativePromptText
        : props.memo.negativePrompts
    const scale = props.memo.scale
    const seed = props.memo.seed
    const clipSkip = props.memo.clipSkip
    const steps = props.memo.steps
    const sampler = props.memo.sampler
    const sizeType = context.config.sizeType
    const vae = context.config.vae ?? ""
    const modelType = context.config.modelType

    context.updateSettings(
      modelId,
      steps,
      modelType,
      sampler,
      scale,
      vae,
      promptText,
      negativePromptText,
      seed,
      sizeType,
      clipSkip,
    )

    toast("設定を復元しました")
  }

  /**
   * タイムスタンプ
   * @param createdAt
   * @returns
   */
  const formatTimestamp = (createdAt: number) => {
    const date = new Date(createdAt * 1000)

    const year = date.getFullYear()

    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    const day = date.getDate().toString().padStart(2, "0")

    const hours = date.getHours().toString().padStart(2, "0")

    const minutes = date.getMinutes().toString().padStart(2, "0")

    return `${year}/${month}/${day} ${hours}:${minutes}`
  }

  return (
    <>
      <div className="relative items-center flex">
        <AppConfirmDialog
          title={"設定を読み込む"}
          description={"現在の設定をメモの内容で上書きされます。"}
          onNext={onRestore}
          onCancel={() => {}}
        >
          <Button className="w-full h-16" variant="ghost">
            <div className="text-left absolute left-2">
              <div className="left-2">{props.memo.title}</div>
              <div className="left-2 top-12">{props.memo.explanation}</div>
              {props.memo.createdAt && (
                <div className="left-2 top-12 opacity-40">
                  {formatTimestamp(props.memo.createdAt)}
                </div>
              )}
            </div>
          </Button>
        </AppConfirmDialog>
        <GenerationConfigMemoUpdateParts
          memo={props.memo}
          refetchMemos={props.refetchMemos}
        />
      </div>
    </>
  )
}
