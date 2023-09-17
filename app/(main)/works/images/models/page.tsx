import type { Metadata } from "next"
import type { ImageModelsQuery } from "__generated__/apollo";
import { ImageModelsDocument } from "__generated__/apollo"
import { MainModels } from "app/(main)/works/images/models/components/MainModels"
import { client } from "app/client"

const ModelsPage = async () => {
  const resp = await client.query<ImageModelsQuery>({
    query: ImageModelsDocument,
    variables: {},
  })

  return <MainModels imageModelsQuery={resp.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ModelsPage
