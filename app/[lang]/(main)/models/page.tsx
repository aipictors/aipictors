import { GoogleAdsense } from "@/app/[lang]/(main)/_components/google-adsense"
import { ImageModelList } from "@/app/[lang]/(main)/models/_components/image-model-list"
import { ArticlePage } from "@/app/_components/page/article-page"
import { createClient } from "@/app/_contexts/client"
import type { ImageModelsQuery } from "@/__generated__/apollo"
import { ImageModelsDocument } from "@/__generated__/apollo"
import type { Metadata } from "next"

/**
 * モデルの一覧
 * @returns
 */
const ModelsPage = async () => {
  const client = createClient()

  const resp = await client.query<ImageModelsQuery>({
    query: ImageModelsDocument,
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

export const revalidate = 60

export default ModelsPage
