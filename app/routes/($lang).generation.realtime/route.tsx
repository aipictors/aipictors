import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Input } from "~/components/ui/input"
import { Slider } from "~/components/ui/slider"
import { AuthContext } from "~/contexts/auth-context"
import { loaderClient } from "~/lib/loader-client"
import { config } from "~/config"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import React, { useEffect, useState } from "react"
import { useContext } from "react"
import RealTimeCanvas from "~/routes/($lang).generation.realtime/components/realtime-canvas"
import { PaintCanvas } from "~/components/paint-canvas"

export const meta: MetaFunction = () => {
  const siteName = "無料AIイラスト生成 - スマホ対応"

  const description =
    "無料で画像生成することができます。1日無料10枚でたくさん生成できます。LoRA、ControlNetにも対応、多数のモデルからお気に入りのイラストを生成できます。生成した画像はすぐに投稿したり、自由に利用したりすることができます。"

  return [
    { title: siteName },
    {
      name: "description",
      content: description,
    },
    { property: "og:title", content: siteName },
    { property: "og:description", content: description },
    { property: "og:site_name", content: siteName },
    {
      property: "og:image",
      content: `${config.siteURL}/opengraph-image.jpg`,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: siteName },
    { name: "twitter:description", content: description },
  ]
}

export async function loader() {
  const promptCategoriesReq = loaderClient.query({
    query: promptCategoriesQuery,
    variables: {},
  })

  const negativePromptCategoriesReq = loaderClient.query({
    query: negativePromptCategoriesQuery,
    variables: {},
  })

  const imageModelsReq = loaderClient.query({
    query: imageModelsQuery,
    variables: {},
  })

  const imageLoraModelsReq = loaderClient.query({
    query: imageLoraModelsQuery,
    variables: {},
  })

  const resp = await Promise.all([
    negativePromptCategoriesReq,
    promptCategoriesReq,
    imageModelsReq,
    imageLoraModelsReq,
  ])

  const [
    negativePromptCategoriesResp,
    promptCategoriesResp,
    imageModelsResp,
    imageLoraModelsResp,
  ] = resp

  return {
    promptCategories: promptCategoriesResp.data.promptCategories,
    negativePromptCategories:
      negativePromptCategoriesResp.data.negativePromptCategories,
    imageModels: imageModelsResp.data.imageModels,
    imageLoraModels: imageLoraModelsResp.data.imageLoraModels,
  }
}

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function GenerationLayout() {
  const data = useLoaderData<typeof loader>()

  const authContext = useContext(AuthContext)

  const [updatedGenerationImageBase64, setUpdatedGenerationImageBase64] =
    useState("")

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  // 生成中かどうか
  const [isGenerating, setIsGenerating] = React.useState(false)

  const [creativity, setCreativity] = React.useState(0.94)

  const [prompts, setPrompts] = React.useState(
    "masterpiece, best quality, 1girl",
  )

  // 描画した結果
  const onChangeCompositionCanvasBase64 = async (value: string) => {
    if (!isGenerating) {
      setIsGenerating(true)
      const response = await fetch(
        "https://www.aipictors.com/wp-content/themes/AISite/generation.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `id=1&prompt=${prompts}&creativity=${creativity}&base64=${encodeURIComponent(
            value,
          )}`,
        },
      )

      const data = (await response.json()) as { status: string; image: string } // Specify the type of 'data'
      if (data.status === "success") {
        // 成功した場合、取得した画像データを状態に設定
        setUpdatedGenerationImageBase64(data.image)
      } else {
        // エラーの場合、エラーログを出力
        console.error("Error with the generation:", data)
      }

      setIsGenerating(false)
    }
  }

  // 描画中かどうか
  const [isDrawing, setIsDrawing] = React.useState(false)

  const [backImageBase64, setBackImageBase64] = React.useState("")

  useEffect(() => {
    if (!isDrawing) {
      // 生成リクエストを送信する
    } else {
      // 生成リクエストをキャンセルする
    }
  }, [isDrawing])

  const context = useGenerationContext()

  if (context.user === null) {
    return (
      <>
        <p>ログインしてください</p>
        <LoginDialogButton
          label="生成"
          isLoading={
            authContext.isLoading ||
            (authContext.isLoggedIn && context.user === null)
          }
          isWidthFull={true}
          triggerChildren={
            <div className="relative max-w-[1120px]">
              <div className="w-full">
                <h1 className="mb-4 font-bold text-2xl">
                  {"リアルタイム生成"}
                </h1>
                <div className="flex items-center">
                  <p className="w-auto font-bold text-sm">プロンプト：</p>
                  <Input
                    value={prompts}
                    className="mr-2 w-80"
                    onChange={(event) => {
                      setPrompts(event.target.value)
                    }}
                  />
                  <p className="w-auto font-bold text-sm">
                    元画像を参考にする度合：
                  </p>
                  <div className="w-32">
                    <Slider
                      aria-label="slider-ex-2"
                      defaultValue={[creativity]}
                      min={0.1}
                      max={1}
                      step={0.01}
                      onValueChange={(value) => {
                        setCreativity(value[0])
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center md:flex-row">
                  <div className="h-[400px] w-[400px] md:h-[512px] md:w-[556px]">
                    <PaintCanvas
                      width={512}
                      height={512}
                      isBackground={true}
                      isColorPicker={true}
                      isPadding={false}
                      backImageBase64={backImageBase64}
                    />
                  </div>
                  <div className="p-4">
                    <RealTimeCanvas
                      width={512}
                      height={512}
                      imageBase64={updatedGenerationImageBase64}
                      isDrawing={isDrawing}
                      isGenerating={isGenerating}
                    />
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </>
    )
  }

  return (
    <>
      <div className="w-full">
        <h1 className="mb-4 font-bold text-2xl">{"リアルタイム生成"}</h1>
        <div className="flex items-center">
          <p className="w-auto font-bold text-sm">プロンプト：</p>
          <Input
            value={prompts}
            className="mr-2 w-80"
            onChange={(event) => {
              setPrompts(event.target.value)
            }}
          />
          <p className="w-auto font-bold text-sm">元画像を参考にする度合：</p>
          <div className="w-32">
            <Slider
              aria-label="slider-ex-2"
              defaultValue={[creativity]}
              min={0.1}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                setCreativity(value[0])
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center md:flex-row">
          <div className="h-[400px] w-[400px] md:h-[512px] md:w-[556px]">
            <PaintCanvas
              width={512}
              height={512}
              isBackground={true}
              isColorPicker={true}
              isPadding={false}
              onChangeSetDrawing={(value: boolean) => {
                setIsDrawing(value)
              }}
              onChangeCompositionCanvasBase64={onChangeCompositionCanvasBase64}
              backImageBase64={backImageBase64}
              setBackImageBase64={(value: string) => {
                setBackImageBase64(value)
              }}
            />
          </div>
          <div className="p-4">
            <RealTimeCanvas
              width={512}
              height={512}
              imageBase64={updatedGenerationImageBase64}
              isDrawing={isDrawing}
              isGenerating={isGenerating}
              updatedPaintCanvasBase64={setBackImageBase64}
            />
          </div>
        </div>
      </div>
    </>
  )
}

const imageLoraModelsQuery = graphql(
  `query ImageLoraModels {
    imageLoraModels {
      id
      name
      description
      license
      prompts
      slug
      thumbnailImageURL
      genre
    }
  }`,
)

const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      id
      name
      displayName
      category
      description
      license
      prompts
      slug
      style
      thumbnailImageURL
      type
    }
  }`,
)

const negativePromptCategoriesQuery = graphql(
  `query NegativePromptCategories {
    negativePromptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }`,
)

const promptCategoriesQuery = graphql(
  `query PromptCategories {
    promptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }`,
)
