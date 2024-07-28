import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { createClient } from "~/lib/client"
import { config } from "~/config"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { GenerationConfigProvider } from "~/routes/($lang).generation._index/components/generation-config-provider"
import { GenerationQueryProvider } from "~/routes/($lang).generation._index/components/generation-query-provider"
import {
  controlNetCategoryContextFragment,
  imageLoraModelContextFragment,
  imageModelContextFragment,
  promptCategoryContextFragment,
} from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { ApolloError } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet, json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"

export const meta: MetaFunction = () => {
  const metaTitle = "無料AIイラスト生成 - スマホ対応"

  const metaDescription =
    "無料で画像生成することができます。1日無料10枚でたくさん生成できます。LoRA、ControlNetにも対応、多数のモデルからお気に入りのイラストを生成できます。生成した画像はすぐに投稿したり、自由に利用したりすることができます。"

  const metaImage = `${config.siteURL}/opengraph-image.jpg`

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export async function loader() {
  try {
    const client = createClient()

    const promptCategoriesReq = client.query({
      query: promptCategoriesQuery,
      variables: {},
    })

    const negativePromptCategoriesReq = client.query({
      query: negativePromptCategoriesQuery,
      variables: {},
    })

    const controlNetCategoriesReq = client.query({
      query: controlNetCategoriesQuery,
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
      controlNetCategoriesReq,
    ])

    const [
      negativePromptCategoriesResp,
      promptCategoriesResp,
      imageModelsResp,
      imageLoraModelsResp,
      controlNetCategoriesResp,
    ] = resp

    return json({
      promptCategories: promptCategoriesResp.data.promptCategories,
      negativePromptCategories:
        negativePromptCategoriesResp.data.negativePromptCategories,
      imageModels: imageModelsResp.data.imageModels,
      imageLoraModels: imageLoraModelsResp.data.imageLoraModels,
      controlNetCategories: controlNetCategoriesResp.data.controlNetCategories,
    })
  } catch (error) {
    if (error instanceof ApolloError) {
      throw new Response(error.message, { status: 500 })
    }
    if (error instanceof Error) {
      throw new Response(error.message, { status: 500 })
    }
    throw new Response("ERROR", { status: 500 })
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
      <HomeHeader title="Aipictors画像生成" />
      <GenerationQueryProvider
        promptCategories={data.promptCategories}
        negativePromptCategories={data.negativePromptCategories}
        controlNetCategories={data.controlNetCategories}
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

const controlNetCategoriesQuery = graphql(
  `query ControlNetCategories {
    controlNetCategories {
      ...ControlNetCategoryContext
    }
  }`,
  [controlNetCategoryContextFragment],
)

const imageLoraModelsQuery = graphql(
  `query ImageLoraModels {
    imageLoraModels {
      ...ImageLoraModelContext
    }
  }`,
  [imageLoraModelContextFragment],
)

const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      ...ImageModelContext
    }
  }`,
  [imageModelContextFragment],
)

const negativePromptCategoriesQuery = graphql(
  `query NegativePromptCategories {
    negativePromptCategories {
      ...PromptCategoryContext
    }
  }`,
  [promptCategoryContextFragment],
)

const promptCategoriesQuery = graphql(
  `query PromptCategories {
    promptCategories {
      ...PromptCategoryContext
    }
  }`,
  [promptCategoryContextFragment],
)
