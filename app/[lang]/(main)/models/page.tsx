import type { Metadata } from "next"
import type { ImageModelsQuery } from "__generated__/apollo"
import { ImageModelsDocument } from "__generated__/apollo"
import { ImageModelList } from "app/[lang]/(main)/models/components/ImageModelList"
import { createClient } from "app/client"

const ModelsPage = async () => {
  const client = createClient()

  const resp = await client.query<ImageModelsQuery>({
    query: ImageModelsDocument,
    variables: {},
  })

  return <ImageModelList imageModelsQuery={resp.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ModelsPage
