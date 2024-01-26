"use client"

import { GenerationMenuButton } from "@/app/[lang]/(beta)/generation/results/[result]/_components/generation-menu-button"
import { GenerationParameters } from "@/app/[lang]/(beta)/generation/results/[result]/_types/generation-parameters"
import {
  GenerationSize,
  parseGenerationSize,
} from "@/app/[lang]/(beta)/generation/results/[result]/_types/generation-size"
import { LoadingPage } from "@/app/_components/page/loading-page"
import { PrivateImage } from "@/app/_components/private-image"
import { Separator } from "@/components/ui/separator"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { useQuery } from "@apollo/client"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { CopyButton } from "./copy-button"

type Props = {
  taskId: string
}

/**
 * 生成情報をクリップボードにコピーする
 * @param generationParameters
 */
export const copyGeneration = (generationParameters: GenerationParameters) => {
  const text =
    generationParameters.prompt +
    "\n" +
    "Negative prompt:" +
    generationParameters.negativePrompt +
    "," +
    "\n" +
    "Steps:" +
    generationParameters.steps +
    ", " +
    "Size:" +
    generationParameters.width +
    "x" +
    generationParameters.height +
    ", " +
    "Seed:" +
    generationParameters.seed +
    ", " +
    "Model:" +
    generationParameters.modelName +
    ", " +
    "Sampler:" +
    generationParameters.sampler +
    ", " +
    "CFG scale:" +
    generationParameters.scale

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast("クリップボードにコピーされました")
    })
    .catch((err) => {
      console.error("クリップボードへのコピーに失敗しました:", err)
    })
}

/**
 * 生成履歴の画像を保存する
 * @param taskId
 * @returns
 */
export const saveGenerationImage = (taskId: string) => {
  const imageElement = document.querySelector(
    ".generation-image-" + taskId,
  ) as HTMLImageElement
  console.log(imageElement)
  if (!imageElement) {
    return
  }
  const imageUrl = imageElement.src
  const link = document.createElement("a")
  link.href = imageUrl
  link.download = taskId + ".png"
  link.click()
}

/**
 * 生成履歴から生成情報を保持して投稿画面に遷移する
 */
export const postGenerationImage = async (
  generationParameters: GenerationParameters,
  taskId: string,
) => {
  async function getBase64ImageFromUrl(url: string) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", url, true)
      xhr.responseType = "blob"

      xhr.onload = () => {
        if (xhr.status === 200) {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result)
          }
          reader.readAsDataURL(xhr.response)
        } else {
          reject(new Error("Failed to load image."))
        }
      }

      xhr.onerror = () => {
        reject(new Error("Failed to load image."))
      }

      xhr.send()
    })
  }

  const imageElement = document.querySelector(
    ".generation-image-" + taskId,
  ) as HTMLImageElement
  console.log(imageElement)
  if (!imageElement) {
    return
  }
  const imageUrl = imageElement.src
  // 画像をbase64に変換してローカルストレージに保存
  localStorage.clear()
  const base64Image: string = (await getBase64ImageFromUrl(imageUrl)) as string
  localStorage.setItem("post-image-temp", base64Image)

  // その他の情報をオブジェクトにまとめてJSON形式でローカルストレージに保存
  const postData = {
    model: generationParameters.modelName,
    vae: generationParameters.vae,
    prompts: generationParameters.prompt,
    negativePrompts: generationParameters.negativePrompt,
    seed: generationParameters.seed,
    steps: generationParameters.steps,
    scale: generationParameters.scale,
    sampler: generationParameters.sampler,
    width: generationParameters.width,
    height: generationParameters.height,
    type: "image",
  }
  const postDataJson = JSON.stringify(postData)
  localStorage.setItem("post-data-temp", postDataJson)

  window.location.href = "https://www.aipictors.com/post"
}

export const ImageGenerationTaskResult = (props: Props) => {
  const { data, loading, error } = useQuery(imageGenerationTaskQuery, {
    variables: {
      id: props.taskId,
    },
  })

  const onReference = () => {
    window.location.href = "/generation/?ref=" + props.taskId
  }

  const onPost = () => {
    window.location.href = "/new/image?ref=" + props.taskId
  }

  if (loading) return <LoadingPage />
  if (error) return <div>{"エラーが発生しました"}</div>

  if (!data || data.imageGenerationTask.token == null) {
    return <div>{"画像が見つかりませんでした"}</div>
  }

  const generationSize: GenerationSize = parseGenerationSize(
    data.imageGenerationTask.sizeType,
  )

  const GenerationParameters: GenerationParameters = {
    prompt: data.imageGenerationTask.prompt,
    vae: data.imageGenerationTask.vae ?? "",
    negativePrompt: data.imageGenerationTask.negativePrompt,
    seed: data.imageGenerationTask.seed,
    steps: data.imageGenerationTask.steps,
    scale: data.imageGenerationTask.scale,
    sampler: data.imageGenerationTask.sampler,
    width: generationSize.width,
    height: generationSize.height,
    modelName: data.imageGenerationTask.model?.name ?? "",
  }

  return (
    <div className="px-4 py-4 w-full max-w-fit mx-auto">
      <PrivateImage
        className={`max-h-screen m-auto generation-image-${props.taskId}`}
        taskId={data.imageGenerationTask.id}
        token={data.imageGenerationTask.token}
        alt={"-"}
      />
      <div className="my-4 flex justify-end">
        <GenerationMenuButton
          title="同じ情報で生成する"
          onClick={onReference}
          text="参照生成"
          icon={ArrowUpRightSquare}
        />
        <GenerationMenuButton
          title="投稿する"
          onClick={() =>
            postGenerationImage(GenerationParameters, props.taskId)
          }
          text="投稿"
          icon={Pencil}
        />
        <GenerationMenuButton
          title="生成情報をコピーする"
          onClick={() => copyGeneration(GenerationParameters)}
          icon={ClipboardCopy}
        />
        <GenerationMenuButton
          title="画像を保存する"
          onClick={() => saveGenerationImage(props.taskId)}
          icon={ArrowDownToLine}
        />
      </div>
      <div className="mb-1">
        <p className="mb-1 font-semibold">{"Size"}</p>
        <p>
          {generationSize.width}x{generationSize.height}
        </p>
      </div>
      <div className="py-2">
        <Separator />
      </div>
      <div className="mb-1">
        <p className="mb-1 font-semibold">{"Model"}</p>
        <p>{data.imageGenerationTask.model?.name}</p>
      </div>
      <div className="py-2">
        <Separator />
      </div>
      <p className="mb-1 font-semibold">{"prompt"}</p>
      <CopyButton className="mb-4" text={data.imageGenerationTask.prompt} />
      <div className="py-2">
        <Separator />
      </div>
      <p className="mb-1 font-semibold">{"NegativePrompt"}</p>
      <CopyButton
        className="mb-4"
        text={data.imageGenerationTask.negativePrompt}
      />
      <div className="py-2">
        <Separator />
      </div>
      <div className="flex space-x-4">
        <div className="w-full">
          <p className="mb-1">{"Seed"}</p>
          <p>{data.imageGenerationTask.seed}</p>
        </div>
        <div className="w-full">
          <p className="mb-1">{"Sampler"}</p>
          <p>{data.imageGenerationTask.sampler}</p>
        </div>
        <div className="w-full">
          <p className="mb-1">{"Scale"}</p>
          <p>{data.imageGenerationTask.scale}</p>
        </div>
      </div>
    </div>
  )
}
