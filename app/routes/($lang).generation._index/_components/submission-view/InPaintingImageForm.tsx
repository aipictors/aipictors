import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { Separator } from "@/_components/ui/separator"
import { createImageGenerationTaskMutation } from "@/_graphql/mutations/create-image-generation-task"
import { fetchImage } from "@/_utils/fetch-image-object-url"
import { uploadImage } from "@/_utils/upload-image"
import { InPaintingSetting } from "@/routes/($lang).generation._index/_components/submission-view/in-painting-setting"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { createBase64FromImageURL } from "@/routes/($lang).generation._index/_utils/create-base64-from-image-url"
import { createRandomString } from "@/routes/($lang).generation._index/_utils/create-random-string"
import { useMutation } from "@apollo/client/index.js"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Props } from "./in-painting-image-form"
import { config } from "@/config"

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
      return fetchImage(
        `${config.wordpressEndpoint.privateImage}?token=${encodeURIComponent(
          props.token,
        )}&name=${props.fileName}`,
      )
    },
  })

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

    const controlNetImageFileName = `${createRandomString(
      30,
    )}_control_net_image.png`

    if (props.userNanoid === null) {
      toast("画面更新して再度お試し下さい。")
      return null
    }

    const controlNetImageUrl = await uploadImage(
      base64,
      controlNetImageFileName,
      props.userNanoid,
    )

    if (controlNetImageUrl === "") return null

    return controlNetImageUrl
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
      const srcFileName = `${createRandomString(30)}_img2img_src.png`
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
      const maskFileName = `${createRandomString(30)}_inpaint_mask_src.png`
      const maskImageURL = await uploadImage(
        maskImageBase64,
        maskFileName,
        props.userNanoid,
      )
      if (maskImageURL === "") return

      const controlNetImageUrl = await getControlNetImageUrl(
        context.config.controlNetImageBase64,
      )

      console.log(srcImageURL)
      console.log(maskImageURL)

      await createTask({
        variables: {
          input: {
            count: 1,
            prompt: promptText,
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
