"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { parseGenerationSize } from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
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
import { createImageGenerationMemoMutation } from "@/graphql/mutations/create-image-generation-memo"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useMutation } from "@apollo/client"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  onClose: () => void
  refetchMemos: () => void
}

/**
 * 履歴メモ保存コンテンツ
 * @param props
 * @returns
 */
export const GenerationConfigMemoSavingContent = (props: Props) => {
  const context = useGenerationContext()

  const [title, setTitle] = useState("設定")

  const [description, setDescription] = useState("")

  const [modelId, setModelId] = useState(context.config.modelId)

  const [prompts, setPrompts] = useState(context.config.promptText)

  const [negativePrompts, setNegativePrompts] = useState(
    context.config.negativePromptText,
  )

  const [steps, setSteps] = useState(context.config.steps)

  const [scale, setScale] = useState(context.config.scale)

  const [seed, setSeed] = useState(context.config.seed)

  const [vae, setVae] = useState(
    context.config.vae === ""
      ? "vae-ft-mse-840000-ema-pruned"
      : context.config.vae,
  )

  const [sampler, setSampler] = useState(
    context.config.sampler === "" ? "DPM++ 2M Karras" : context.config.sampler,
  )

  const [clipSkip, setClipSkip] = useState(context.config.clipSkip)

  const size = parseGenerationSize(context.config.sizeType)

  const [width, setWidth] = useState(0)

  const [height, setHeight] = useState(0)

  const [createMemo, { loading: isCreatingMemo }] = useMutation(
    createImageGenerationMemoMutation,
    {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    },
  )

  const onCreateMemo = async () => {
    await createMemo({
      variables: {
        input: {
          title: title,
          explanation: description,
          prompts: prompts,
          negativePrompts: negativePrompts,
          sampler: sampler,
          modelId: modelId,
          seed: seed,
          steps: steps,
          scale: scale,
          vae: vae ?? "",
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
        <div className="w-full">
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
        <div className="w-full">
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
        <div className="w-full">
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
        <div className="w-full">
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
        <div className="w-full">
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
        <div className="w-full">
          {"VAE"}
          <Select
            value={vae ?? "vae-ft-mse-840000-ema-pruned"}
            onValueChange={(value) => {
              setVae(value)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              {config.generationFeature.vaeValues.map((vae) => (
                <SelectItem key={vae} value={vae}>
                  {vae}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isCreatingMemo ? (
        <Loader2 className="w-4 animate-spin" />
      ) : (
        <Button
          className="mt-8 mb-4 w-full"
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
    </>
  )
}
