import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import { imageLoraModelsQuery } from "@/_graphql/queries/image-model/image-lora-models"
import { imageModelsQuery } from "@/_graphql/queries/image-model/image-models"
import { promptCategoriesQuery } from "@/_graphql/queries/prompt-category/prompt-category"
import { createClient } from "@/_lib/client"
import { config } from "@/config"
import { HomeHeader } from "@/routes/($lang)._main._index/_components/home-header"
import { GenerationConfigProvider } from "@/routes/($lang).generation._index/_components/generation-config-provider"
import { GenerationQueryProvider } from "@/routes/($lang).generation._index/_components/generation-query-provider"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet, useLoaderData } from "@remix-run/react"
import { useContext } from "react"

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

  const imageModelsReq = client.query({
    query: imageModelsQuery,
    variables: {},
  })

  const imageLoraModelsReq = client.query({
    query: imageLoraModelsQuery,
    variables: {},
  })

  const resp = await Promise.all([
    promptCategoriesReq,
    imageModelsReq,
    imageLoraModelsReq,
  ])

  const [promptCategoriesResp, imageModelsResp, imageLoraModelsResp] = resp

  return {
    promptCategories: promptCategoriesResp.data.promptCategories,
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

  return (
    <>
      <HomeHeader title="画像生成 β" />
      <GenerationQueryProvider
        promptCategories={data.promptCategories}
        imageModels={data.imageModels}
        imageLoraModels={data.imageLoraModels}
      >
        <GenerationConfigProvider>
          <div className="container max-w-none">
            <Outlet />
          </div>
        </GenerationConfigProvider>
      </GenerationQueryProvider>
    </>
  )
}
