import { Metadata } from "next"
import { ImageModelDocument, ImageModelQuery } from "__generated__/apollo"
import { client } from "app/client"
import { MainModel } from "app/models/[model]/components/MainModel"

type Props = {
  params: {
    model: string
  }
}

const SettingModelsPage = async (props: Props) => {
  const resp = await client.query<ImageModelQuery>({
    query: ImageModelDocument,
    variables: {
      id: props.params.model,
    },
  })

  return <MainModel imageModelQuery={resp.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingModelsPage
