"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"
import { deleteImageGenerationMemoMutation } from "@/graphql/mutations/delete-image-generation-memo"
import { useMutation } from "@apollo/client"
import { Trash2Icon } from "lucide-react"
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

  const [deleteTask] = useMutation(deleteImageGenerationMemoMutation)

  const context = useGenerationContext()

  const onDelete = async () => {
    await deleteTask({
      variables: {
        input: {
          nanoid: props.memo.nanoid,
        },
      },
    })
    props.refetchMemos()
    toast("削除しました")
  }

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
            </div>
          </Button>
        </AppConfirmDialog>
        <AppConfirmDialog
          title={"設定を削除する"}
          description={"選択したメモを削除しますか？"}
          onNext={onDelete}
          onCancel={() => {}}
        >
          <Button className="absolute right-2" variant={"ghost"} size={"icon"}>
            <Trash2Icon className="w-4" />
          </Button>
        </AppConfirmDialog>
      </div>
    </>
  )
}
