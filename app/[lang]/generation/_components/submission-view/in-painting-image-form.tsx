"use client"

import { InPaintingSetting } from "@/app/[lang]/generation/_components/submission-view/in-painting-setting"
import { createBase64FromImageURL } from "@/app/[lang]/generation/_utils/create-base64-from-image-url"
import { createRandomString } from "@/app/[lang]/generation/_utils/create-random-string"
import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { uploadImage } from "@/app/_utils/upload-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { config } from "@/config"
import type { ImageGenerationSizeType } from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { useMutation } from "@apollo/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  taskId: string
  token: string
  userNanoid: string | null
  configSeed: number
  configSteps: number
  configSampler: string
  configScale: number
  configSizeType: string
  configModel: string | null
  configVae: string | null
  configClipSkip: number
  onClose(): void
}

/**
 * インペイント用のフォーム
 * @param count
 * @returns
 */
export const InPaintingImageForm = (props: Props) => {
  if (
    props.taskId === "" ||
    props.token === "" ||
    props.configModel === null ||
    props.configVae === null
  ) {
    throw new Error()
  }

  const { data } = useSuspenseQuery({
    queryKey: [props.taskId],
    queryFn() {
      return fetchImage(config.wordpressEndpoint.privateImage, props.token)
    },
  })

  const [createTask] = useMutation(createImageGenerationTaskMutation)

  const [maskImageBase64, setMaskImageBase64] = useState("")

  const [isLoading, setIsLoading] = useState(true)

  const [promptText, setPromptText] = useState("")

  const [fillSize, setMaskType] = useState("")

  const [denoisingStrengthSize, setDenoisingStrengthSize] = useState("")

  const onChangePrompt = (value: string) => {
    setPromptText(value)
  }

  const onChangeMaskType = (value: string) => {
    setMaskType(value)
  }

  const onChangeDenoisingStrengthSize = (value: string) => {
    setDenoisingStrengthSize(value)
  }

  const onChangePaint = (imageBase64: string) => {
    setMaskImageBase64(imageBase64)
  }

  const onCreateTask = async () => {
    if (!props.userNanoid) {
      toast("画面更新して再度お試し下さい。")
      return
    }
    if (props.configModel === null || props.configVae === null) {
      toast("モデル情報が正しく取得できませんでした")
      return
    }
    if (promptText === "") {
      toast("修正内容のキーワード（プロンプト）を入力してください")
      return
    }
    try {
      const srcImageBase64 = await createBase64FromImageURL(data)
      if (srcImageBase64 === "" || srcImageBase64 === undefined) {
        toast(
          "画像の読み込みに失敗しました、しばらくしてから再度実行してください。",
        )
        return
      }
      const srcFileName = `${createRandomString(30)}_inpaint_mask_src.png`
      const srcImageURL = await uploadImage(
        srcImageBase64,
        srcFileName,
        props.userNanoid,
      )
      if (srcImageURL === "" || srcImageURL === undefined) {
        toast(
          "画像の読み込みに失敗しました、しばらくしてから再度実行してください。",
        )
        return
      }
      const maskFileName = `${createRandomString(30)}_img2img_src.png`
      const maskImageURL = await uploadImage(
        maskImageBase64,
        maskFileName,
        props.userNanoid,
      )
      if (maskImageURL === "") return
      await createTask({
        variables: {
          input: {
            count: 1,
            prompt: promptText,
            negativePrompt: "",
            sampler: props.configSampler,
            seed: props.configSeed,
            steps: props.configSteps,
            scale: props.configScale,
            sizeType: props.configSizeType as ImageGenerationSizeType,
            model: props.configModel,
            vae: props.configVae,
            clipSkip: props.configClipSkip,
            type: "INPAINTING",
            t2tImageUrl: srcImageURL,
            t2tMaskImageUrl: maskImageURL,
            t2tDenoisingStrengthSize: denoisingStrengthSize,
            t2tInpaintingFillSize: fillSize,
          },
        },
      })
      props.onClose()
      toast("生成をリクエストしました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <div>
          <p className="text-lg">{"一部修正"}</p>
          <p className="text-md">
            {
              "画像の修正したい箇所を塗潰して置き換えたい内容のキーワードを入力してください"
            }
          </p>
        </div>
        <div>
          <Input
            onChange={(event) => {
              onChangePrompt(event.target.value)
            }}
            placeholder="修正内容のキーワード（英単語）"
          />
        </div>
        <div className="py-2">
          <Separator />
        </div>
        <InPaintingSetting
          onChangeDenoisingStrengthSize={onChangeDenoisingStrengthSize}
          onChangeMaskType={onChangeMaskType}
        />
        <div className="py-2">
          <Separator />
        </div>
        <InPaintingEditImage
          onLoaded={() => setIsLoading(false)}
          isLoading={isLoading}
          onChange={onChangePaint}
          imageUrl={data}
        />
      </div>
      <div>
        <Button disabled={isLoading} onClick={onCreateTask}>
          {"修正する"}
        </Button>
      </div>
    </>
  )
}

const InPaintingEditImage = dynamic(
  () => {
    return import(
      "@/app/[lang]/generation/_components/submission-view/in-painting-edit-image"
    )
  },
  { ssr: false },
)
