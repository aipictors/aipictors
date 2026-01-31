import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { InPaintingSetting } from "~/routes/($lang).generation._index/components/submission-view/in-painting-setting"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { createBase64FromImageURL } from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"
import { useMutation } from "@apollo/client/index"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Props } from "./in-painting-image-form"
import { graphql } from "gql.tada"

/**
 * インペイント用のフォーム
 * @param count
 */

export function InPaintingImageForm (props: Props) {
  if (
    props.taskId === "" ||
    props.token === "" ||
    props.configModel === null ||
    props.configVae === null
  ) {
    throw new Error()
  }

  const [createTask, { loading: isCreatingTask }] = useMutation(
    createImageGenerationTaskMutation,
  )

  const [maskImageBase64, setMaskImageBase64] = useState("")

  const [promptText, setPromptText] = useState("")

  const [fillSize, setMaskType] = useState("0")

  const [denoisingStrengthSize, setDenoisingStrengthSize] = useState("0.5")

  const context = useGenerationContext()

  const onChangePrompt = (value: string) => {
    setPromptText(value)
  }

  const onChangeMaskType = (value: string) => {
    setMaskType(value)
  }

  const onChangeDenoisingStrengthSize = (value: string) => {
    setDenoisingStrengthSize(value)
  }

  useEffect(() => {
    setMaskImageBase64(props.maskBase64)
  }, [props.maskBase64])

  const getControlNetImageUrl = async (base64: string | null) => {
    if (base64 === null) {
      return null
    }

    const controlNetImageUrl = await uploadPublicImage(base64, props.token)
    return controlNetImageUrl || null
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
      const srcImageBase64 = await createBase64FromImageURL(props.imageUrl)
      if (srcImageBase64 === "" || srcImageBase64 === undefined) {
        toast(
          "画像の読み込みに失敗しました、しばらくしてから再度実行してください。",
        )
        return
      }
      const srcImageURL = await uploadPublicImage(srcImageBase64, props.token)
      if (srcImageURL === "" || srcImageURL === undefined) {
        toast(
          "画像の読み込みに失敗しました、しばらくしてから再度実行してください。",
        )
        return
      }
      const maskImageURL = await uploadPublicImage(maskImageBase64, props.token)
      if (maskImageURL === "") return

      const controlNetImageUrl = await getControlNetImageUrl(
        context.config.controlNetImageBase64,
      )

      await createTask({
        variables: {
          input: {
            count: 1,
            prompt: promptText,
            isPromptGenerationEnabled:
              context.config.languageUsedForPrompt === "jp",
            negativePrompt: "",
            sampler: props.configSampler,
            seed: -1,
            steps: props.configSteps,
            scale: props.configScale,
            sizeType: "SD2_768_768",
            model: props.configModel,
            vae: props.configVae,
            clipSkip: props.configClipSkip,
            type: "INPAINTING",
            t2tImageUrl: srcImageURL,
            t2tMaskImageUrl: maskImageURL,
            t2tDenoisingStrengthSize: denoisingStrengthSize,
            t2tInpaintingFillSize: fillSize,
            controlNetImageUrl: controlNetImageUrl,
            controlNetWeight: context.config.controlNetWeight
              ? Number(context.config.controlNetWeight)
              : null,
            controlNetModel: context.config.controlNetModel,
            controlNetModule: context.config.controlNetModule,
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
      <div className="mt-16 mr-16 flex flex-col p-4">
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
        <Button
          disabled={isCreatingTask || !maskImageBase64 || !promptText}
          onClick={onCreateTask}
        >
          {"修正する"}
        </Button>
      </div>
    </>
  )
}

export const InPaintingImageFormFragment = graphql(
  `fragment InPaintingImageForm on ImageGenerationResultNode @_unmask {
    id
    nanoid
    prompt
    promptsText
    negativePrompt
    upscaleSize
    seed
    steps
    scale
    sampler
    clipSkip
    imageUrl
    sizeType
    vae
    controlNetModule
    controlNetWeight
    thumbnailUrl
    status
    completedAt
    model {
      id
      name
    }
  }`,
)

export const InPaintingImageFormTaskFragment = graphql(
  `fragment InPaintingImageFormTask on ImageGenerationTaskNode @_unmask {
    id
    nanoid
    prompt
    promptsText
    negativePrompt
    upscaleSize
    seed
    steps
    scale
    sampler
    clipSkip
    imageUrl
    sizeType
    vae
    controlNetModule
    controlNetWeight
    thumbnailUrl
    status
    completedAt
    model {
      id
      name
    }
  }`,
)

const createImageGenerationTaskMutation = graphql(
  `mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      ...InPaintingImageFormTask
    }
  }`,
  [InPaintingImageFormTaskFragment],
)
