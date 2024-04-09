import { GoogleAdsense } from "@/[lang]/(main)/_components/google-adsense"
import { ImageModelList } from "@/[lang]/(main)/models/_components/image-model-list"
import { ArticlePage } from "@/_components/page/article-page"
import { imageModelsQuery } from "@/_graphql/queries/image-model/image-models"
import { createClient } from "@/_lib/client"
import { useLoaderData } from "@remix-run/react"
import type { Metadata } from "next"

/**
 * モデルの一覧
 * @returns
 */
export async function loader() {
  const client = createClient()

  const resp = await client.query({
    query: imageModelsQuery,
    variables: {},
  })
  return {
    resp,
  }
}

export default function Models() {
  const data = useLoaderData<typeof loader>()

  return (
    <ArticlePage>
      <ImageModelList imageModels={data.resp.data.imageModels} />
      <GoogleAdsense slot={"5201832236"} format={"auto"} responsive={"true"} />
    </ArticlePage>
  )
}
