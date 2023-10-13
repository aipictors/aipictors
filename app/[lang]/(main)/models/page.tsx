import type { Metadata } from "next"
import type { ImageModelsQuery } from "__generated__/apollo"
import { ImageModelsDocument } from "__generated__/apollo"
import { GoogleAdsense } from "app/[lang]/(main)/components/Adsense"
import { ImageModelList } from "app/[lang]/(main)/models/components/ImageModelList"
import { createClient } from "app/client"
import { ArticlePage } from "app/components/ArticlePage"

const ModelsPage = async () => {
  const client = createClient()

  const resp = await client.query<ImageModelsQuery>({
    query: ImageModelsDocument,
    variables: {},
  })

  return (
    <ArticlePage>
      <ImageModelList imageModelsQuery={resp.data} />
      <GoogleAdsense
        slot="5201832236"
        style={{ display: "block" }}
        format="auto"
        responsive="true"
      />
    </ArticlePage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ModelsPage
