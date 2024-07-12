import { ArticlePage } from "@/_components/page/article-page"
import { createClient } from "@/_lib/client"
import { GoogleAdsense } from "@/routes/($lang)._main._index/_components/google-adsense"
import {
  imageModelCardFragment,
  ImageModelList,
} from "@/routes/($lang)._main.models._index/_components/image-model-list"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

/**
 * モデルの一覧
 */
export async function loader() {
  const client = createClient()

  const resp = await client.query({
    query: imageModelsQuery,
    variables: {},
  })

  return json({
    imageModels: resp.data.imageModels,
  })
}

export default function ModelsPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <ArticlePage>
      <ImageModelList imageModels={data.imageModels} />
      <GoogleAdsense slot={"5201832236"} format={"auto"} responsive={"true"} />
    </ArticlePage>
  )
}

export const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      ...ImageModelCard
    }
  }`,
  [imageModelCardFragment],
)
