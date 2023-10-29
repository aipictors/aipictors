import type { ImageModelsQuery } from "__generated__/apollo"
import { ImageModelsDocument } from "__generated__/apollo"
import { GoogleAdsense } from "app/[lang]/(main)/_components/Adsense"
import { ImageModelList } from "app/[lang]/(main)/models/_components/ImageModelList"
import { ArticlePage } from "app/_components/ArticlePage"
import { createClient } from "app/_utils/client"
import type { Metadata } from "next"

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
