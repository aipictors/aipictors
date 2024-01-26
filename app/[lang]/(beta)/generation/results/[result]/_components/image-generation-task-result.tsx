"use client"

import { GenerationMenuButton } from "@/app/[lang]/(beta)/generation/results/[result]/_components/generation-menu-button"
import {
  GenerationSize,
  parseGenerationSize,
} from "@/app/[lang]/(beta)/generation/results/[result]/_types/generation-size"
import { LoadingPage } from "@/app/_components/page/loading-page"
import { PrivateImage } from "@/app/_components/private-image"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { useQuery } from "@apollo/client"
import {
  ArrowDownToLine,
  ArrowUpRightSquare,
  ClipboardCopy,
} from "lucide-react"
import { toast } from "sonner"
import { CopyButton } from "./copy-button"

type Props = {
  taskId: string
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

  if (loading) return <LoadingPage />
  if (error) return <div>{"エラーが発生しました"}</div>

  if (!data || data.imageGenerationTask.token == null) {
    return <div>{"画像が見つかりませんでした"}</div>
  }

  const generationSize: GenerationSize = parseGenerationSize(
    data.imageGenerationTask.sizeType,
  )
  const onCopyGeneration = () => {
    const text =
      data.imageGenerationTask.prompt +
      "\n" +
      "Negative prompt:" +
      data.imageGenerationTask.negativePrompt +
      "," +
      "\n" +
      "Steps:" +
      data.imageGenerationTask.steps +
      ", " +
      "Size:" +
      generationSize.width +
      "x" +
      generationSize.height +
      ", " +
      "Seed:" +
      data.imageGenerationTask.seed +
      ", " +
      "Model:" +
      data.imageGenerationTask.model +
      ", " +
      "Sampler:" +
      data.imageGenerationTask.sampler +
      ", " +
      "CFG scale:" +
      data.imageGenerationTask.scale

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("クリップボードにコピーされました")
      })
      .catch((err) => {
        console.error("クリップボードへのコピーに失敗しました:", err)
      })
  }

  const onSaveImage = () => {
    const imageElement = document.querySelector(
      ".generation-image-" + props.taskId,
    ) as HTMLImageElement
    console.log(imageElement)
    if (!imageElement) {
      return
    }
    const imageUrl = imageElement.src
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = props.taskId + ".png"
    link.click()
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
          icon={ArrowUpRightSquare}
        />
        <GenerationMenuButton
          title="生成情報をコピーする"
          onClick={onCopyGeneration}
          icon={ClipboardCopy}
        />
        <GenerationMenuButton
          title="画像を保存する"
          onClick={onSaveImage}
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
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Detail</AccordionTrigger>
          <AccordionContent>
            <p className="mb-1">{"prompt"}</p>
            <CopyButton
              className="mb-4"
              text={data.imageGenerationTask.prompt}
            />
            <p className="mb-1">{"NegativePrompt"}</p>
            <CopyButton
              className="mb-4"
              text={data.imageGenerationTask.negativePrompt}
            />
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
