"use client"

import { InPaintingSetting } from "@/app/[lang]/(beta)/generation/_components/in-painting-setting"
import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { uploadImage } from "@/app/_utils/upload-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Config } from "@/config"
import { ImageGenerationSizeType } from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { useMutation } from "@apollo/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  isOpen: boolean
  onClose(): void
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
}

interface RequestInpaintGenerationTaskProps {
  userNanoid: string
  promptText: string
  configSteps: number
  paintMaskImageBase64: string
  paintImageBase64: string
  configSeed: number
  configSampler: string
  configScale: number
  configSizeType: string
  configModel: string
  configVae: string
  t2tDenoisingStrengthSize: string
  t2tInpaintingFillSize: string
}

/**
 * ランダムな文字列を取得
 * @param count
 * @returns
 */
export const getRandomStr = (count: number) => {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789"
  let result = ""
  const charactersLength = characters.length
  for (let i = 0; i < count; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const getBase64FromImageUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute("crossOrigin", "anonymous")
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL("image/png")
        resolve(dataURL)
      } else {
        reject("ctx is null")
      }
    }
    img.src = url
  })
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
    !props.configModel ||
    !props.configVae
  )
    throw new Error()
  const { data } = useSuspenseQuery({
    queryKey: [props.taskId],
    queryFn() {
      return fetchImage(Config.wordpressPrivateImageEndpoint, props.token)
    },
  })
  const [paintImageBase64, setPaintImageBase64] = useState("")
  const onChangePaint = (imageBase64: string) => {
    setPaintImageBase64(imageBase64)
  }
  const [createTask, { loading }] = useMutation(
    createImageGenerationTaskMutation,
  )

  const requestInpaintGenerationTask = async (
    props: RequestInpaintGenerationTaskProps,
  ) => {
    if (!props.userNanoid) {
      toast("ログインしてから実行してください")
      return
    }

    const fileMaskName = getRandomStr(30) + "_inpaint_mask_src.png"
    try {
      const fileMaskPath = await uploadImage(
        props.paintMaskImageBase64,
        fileMaskName,
        props.userNanoid,
      )
      if (fileMaskPath === "") return

      const fileSrcName = getRandomStr(30) + "_img2img_src.png"
      const fileSrcPath = await uploadImage(
        props.paintImageBase64,
        fileSrcName,
        props.userNanoid,
      )
      if (fileSrcPath === "") return

      // ここでリクエストする
      console.log(fileMaskPath)
      console.log(fileSrcPath)
      await createTask({
        variables: {
          input: {
            // propsから直接プロパティを展開
            count: 1,
            model: props.configModel,
            vae: props.configVae,
            prompt: props.promptText,
            negativePrompt: "",
            seed: props.configSeed,
            steps: props.configSteps,
            scale: props.configScale,
            sampler: props.configSampler,
            sizeType: props.configSizeType as ImageGenerationSizeType,
            type: "INPAINTING",
            t2tImageUrl: fileSrcPath,
            t2tMaskImageUrl: fileMaskPath,
            t2tDenoisingStrengthSize: props.t2tDenoisingStrengthSize,
            t2tInpaintingFillSize: props.t2tInpaintingFillSize,
          },
        },
      })
      toast("生成リクエストしました")
    } catch (error) {
      console.error(error)
    }
  }

  const [isLoading, setIsLoading] = useState(true)
  const [promptText, setPromptText] = useState("")
  const [maskType, setMaskType] = useState("")
  const [denoisingStrengthSize, setDenoisingStrengthSize] = useState("")
  const handlePromptTextChange = (value: string) => {
    setPromptText(value)
  }
  const handleMaskTypeChange = (value: string) => {
    setMaskType(value)
  }
  const handleDenoisingStrengthSizeChange = (value: string) => {
    setDenoisingStrengthSize(value)
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
            onChange={(e) => handlePromptTextChange(e.target.value)}
            placeholder="修正内容のキーワード（英単語）"
          />
        </div>
        <div className="py-2">
          <Separator />
        </div>
        <InPaintingSetting
          onChangeDenoisingStrengthSize={handleDenoisingStrengthSizeChange}
          onChangeMaskType={handleMaskTypeChange}
        />
        <div className="py-2">
          <Separator />
        </div>
        <InPaintingEditImage
          onLoaded={() => setIsLoading(false)}
          isLoading={isLoading}
          onChange={(imageBase64: string) => onChangePaint(imageBase64)}
          imageUrl={data}
        />
      </div>
      <div>
        <Button
          disabled={isLoading}
          onClick={async () => {
            if (props.userNanoid === null) {
              toast("ログインしてから実行してください")
              return
            }
            if (!props.configModel || !props.configVae) {
              toast("モデル情報が正しく取得できませんでした")
              return
            }
            const srcImageBase64 = await getBase64FromImageUrl(data)
            if (srcImageBase64 === "") return
            props.onClose()
            await requestInpaintGenerationTask({
              userNanoid: props.userNanoid,
              promptText: promptText,
              configSteps: props.configSteps,
              paintMaskImageBase64: srcImageBase64,
              paintImageBase64: paintImageBase64,
              configSeed: props.configSeed,
              configSampler: props.configSampler,
              configScale: props.configScale,
              configSizeType: props.configSizeType,
              configModel: props.configModel,
              configVae: props.configVae,
              t2tDenoisingStrengthSize: denoisingStrengthSize,
              t2tInpaintingFillSize: maskType,
            })
          }}
        >
          {"修正する"}
        </Button>
      </div>
    </>
  )
}

const InPaintingEditImage = dynamic(
  () => {
    return import(
      "@/app/[lang]/(beta)/generation/_components/in-painting-edit-image"
    )
  },
  { ssr: false },
)
