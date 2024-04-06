import { GoogleAdsense } from "@/[lang]/(main)/_components/google-adsense"
import { ImageModelList } from "@/[lang]/(main)/models/_components/image-model-list"
import { ArticlePage } from "@/_components/page/article-page"
import { imageModelsQuery } from "@/_graphql/queries/image-model/image-models"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"

/**
 * モデルの一覧
 * @returns
 */
const ModelsPage = async () => {
  const client = createClient()

  const resp = await client.query({
    query: imageModelsQuery,
    variables: {},
  })

  return (
    <ArticlePage>
      <ImageModelList imageModels={resp.data.imageModels} />
      <GoogleAdsense slot={"5201832236"} format={"auto"} responsive={"true"} />
    </ArticlePage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default ModelsPage
