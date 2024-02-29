"use client"

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
import { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"
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
      <div className="flex items-center mt-8 mb-4">
        {isDeletingMemo ? (
          <Loader2 className="w-16 mr-2 animate-spin" />
        ) : (
          <AppConfirmDialog
            title={"設定を削除する"}
            description={"選択したメモを削除しますか？"}
            onNext={onDelete}
            onCancel={() => {}}
          >
            <Button className="w-16 h-11 mr-2" variant={"ghost"} size={"icon"}>
              <Trash2Icon className="w-4" />
            </Button>
          </AppConfirmDialog>
        )}

        {isUpdatingMemo ? (
          <Loader2 className="w-16 animate-spin" />
        ) : (
          <Button
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
