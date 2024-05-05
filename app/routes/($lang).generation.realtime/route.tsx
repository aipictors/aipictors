import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AppPageCenter } from "@/_components/app/app-page-center"
import PaintCanvas from "@/_components/paint-canvas"
import { AuthContext } from "@/_contexts/auth-context"
import { imageLoraModelsQuery } from "@/_graphql/queries/image-model/image-lora-models"
import { imageModelsQuery } from "@/_graphql/queries/image-model/image-models"
import { negativePromptCategoriesQuery } from "@/_graphql/queries/negative-prompt-category/negative-prompt-category"
import { promptCategoriesQuery } from "@/_graphql/queries/prompt-category/prompt-category"
import { createClient } from "@/_lib/client"
import { config } from "@/config"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { useContext } from "react"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control":
      "max-age=0, s-maxage=60, stale-while-revalidate=2592000, stale-if-error=2592000",
  }
}

export const meta: MetaFunction = () => {
  const siteName = "無料AIイラスト生成 - スマホ対応"

  const description =
    "無料で画像生成することができます。1日無料30枚でたくさん生成できます。LoRA、ControlNetにも対応、多数のモデルからお気に入りのイラストを生成できます。生成した画像はすぐに投稿したり、自由に利用したりすることができます。"

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

export const loader = async () => {
  const client = createClient()

  const promptCategoriesReq = client.query({
    query: promptCategoriesQuery,
    variables: {},
  })

  const negativePromptCategoriesReq = client.query({
    query: negativePromptCategoriesQuery,
    variables: {},
  })

  const imageModelsReq = client.query({
    query: imageModelsQuery,
    variables: {},
  })

  const imageLoraModelsReq = client.query({
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

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  const onChangeBrushImageBase64 = (value: string) => {
    console.log(value)
  }

  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"リアルタイム生成"}</h1>
          <PaintCanvas
            onChangeBrushImageBase64={onChangeBrushImageBase64}
            width={512}
            height={512}
            isBackground={true}
            isColorPicker={true}
          />
        </div>
      </AppPageCenter>
    </>
  )
}
