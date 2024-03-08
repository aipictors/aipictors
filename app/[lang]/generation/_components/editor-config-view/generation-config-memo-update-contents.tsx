"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { config } from "@/config"
import type { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"
import { deleteImageGenerationMemoMutation } from "@/graphql/mutations/delete-image-generation-memo"
import { updateImageGenerationMemoMutation } from "@/graphql/mutations/update-image-generation-memo"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useMutation } from "@apollo/client"
import { Loader2, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  onClose: () => void
  refetchMemos: () => void
  memo: ImageGenerationMemoNode
}

/**
 * 履歴メモ更新コンテンツ
 * @param props
 * @returns
 */
export const GenerationConfigMemoUpdateContent = (props: Props) => {
  const context = useGenerationContext()

  const [title, setTitle] = useState(props.memo.title)

  const [description, setDescription] = useState(props.memo.explanation)

  const [modelId, setModelId] = useState(props.memo.model.id)

  const [prompts, setPrompts] = useState(props.memo.prompts)

  const [negativePrompts, setNegativePrompts] = useState(
    props.memo.negativePrompts,
  )

  const [steps, setSteps] = useState(props.memo.steps)

  const [scale, setScale] = useState(props.memo.scale)

  const [seed, setSeed] = useState(props.memo.seed)

  const [sampler, setSampler] = useState(
    props.memo.sampler === "" ? "DPM++ 2M Karras" : props.memo.sampler,
  )

  const [clipSkip, setClipSkip] = useState(props.memo.clipSkip)

  const [width, setWidth] = useState(0)

  const [height, setHeight] = useState(0)

  const [updateMemo, { loading: isUpdatingMemo }] = useMutation(
    updateImageGenerationMemoMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    },
  )

  const [deleteMemo, { loading: isDeletingMemo }] = useMutation(
    deleteImageGenerationMemoMutation,
  )

  const onDelete = async () => {
    await deleteMemo({
      variables: {
        input: {
          nanoid: props.memo.nanoid,
        },
      },
    })
    props.refetchMemos()
    toast("削除しました")
    props.onClose()
  }

  console.log(prompts)

  const onCreateMemo = async () => {
    await updateMemo({
      variables: {
        input: {
          nanoid: props.memo.nanoid,
          title: title,
          explanation: description,
          prompts: prompts,
          negativePrompts: negativePrompts,
          sampler: sampler,
          modelId: modelId,
          seed: seed,
          steps: steps,
          scale: scale,
          clipSkip: clipSkip,
          width: width,
          height: height,
        },
      },
    })
    props.refetchMemos()
  }

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

  return (
    <>
      {"*タイトル"}
      <Input
        onChange={(event) => {
          setTitle(event.target.value)
        }}
        type="text"
        value={title}
        placeholder="タイトル"
      />
      {"説明（省略可）"}
      <Input
        onChange={(event) => {
          setDescription(event.target.value)
        }}
        type="text"
        value={description}
        placeholder="説明（省略可）"
      />
      {"プロンプト"}
      <Textarea
        onChange={(event) => {
          setPrompts(event.target.value)
        }}
        value={prompts}
        placeholder="プロンプト"
      >
        {prompts}
      </Textarea>
      {"ネガティブプロンプト"}
      <Textarea
        onChange={(event) => {
          setNegativePrompts(event.target.value)
        }}
        value={negativePrompts}
        placeholder="ネガティブプロンプト"
      >
        {negativePrompts}
      </Textarea>
      <div className="flex items-center space-x-2">
        <div>
          {"Steps"}
          <Input
            onChange={(event) => {
              setSteps(Number(event.target.value))
            }}
            type="number"
            value={steps}
            placeholder="Steps"
          />
        </div>
        <div>
          {"Scale"}
          <Input
            onChange={(event) => {
              setScale(Number(event.target.value))
            }}
            type="number"
            value={scale}
            placeholder="Scale"
          />
        </div>
        <div>
          {"Seeds"}
          <Input
            onChange={(event) => {
              setSeed(Number(event.target.value))
            }}
            type="number"
            value={seed}
            placeholder="Seeds"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div>
          {"ClipSkip"}
          <Input
            onChange={(event) => {
              setClipSkip(Number(event.target.value))
            }}
            type="number"
            value={clipSkip}
            placeholder="ClipSkip"
          />
        </div>
        {/* <div>
          {"幅"}
          <Input
            onChange={(event) => {
              setWidth(Number(event.target.value))
            }}
            type="number"
            value={width}
            placeholder="幅"
          />
        </div>
        <div>
          {"高さ"}
          <Input
            onChange={(event) => {
              setHeight(Number(event.target.value))
            }}
            type="number"
            value={height}
            placeholder="高さ"
          />
        </div> */}
        <div>
          {"Sampler"}
          <Select
            value={sampler}
            onValueChange={(value) => {
              setSampler(value)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {config.generationFeature.samplerValues.map((sampler) => (
                <SelectItem key={sampler} value={sampler}>
                  {sampler}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 mb-0 flex items-center">
        {isDeletingMemo ? (
          <Loader2 className="mr-2 w-16 animate-spin" />
        ) : (
          <AppConfirmDialog
            title={"設定を削除する"}
            description={"選択したメモを削除しますか？"}
            onNext={onDelete}
            onCancel={() => {}}
          >
            <Button className="mr-2 h-11 w-16" variant={"ghost"} size={"icon"}>
              <Trash2Icon className="mr-4 w-4" />
            </Button>
          </AppConfirmDialog>
        )}

        <Button
          variant={"secondary"}
          className="mr-4 w-full"
          onClick={() => {
            onRestore()
          }}
        >
          {"使用する"}
        </Button>
        {isUpdatingMemo ? (
          <Loader2 className="w-16 animate-spin" />
        ) : (
          <Button
            variant={"secondary"}
            className="w-full"
            onClick={() => {
              if (title === "") {
                toast("タイトルを入力してください")
                return
              }
              props.onClose()
              onCreateMemo()
            }}
          >
            {"保存する"}
          </Button>
        )}
      </div>
    </>
  )
}
