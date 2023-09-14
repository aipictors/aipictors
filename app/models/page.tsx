import { Metadata } from "next"
import { ImageModelsDocument, ImageModelsQuery } from "__generated__/apollo"
import { client } from "app/client"
import { MainModels } from "app/models/components/MainModels"

const SettingModelsPage = async () => {
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

export default SettingModelsPage
