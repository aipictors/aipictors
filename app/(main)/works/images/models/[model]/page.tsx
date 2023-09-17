import type { Metadata } from "next"
import type { ImageModelQuery } from "__generated__/apollo";
import { ImageModelDocument } from "__generated__/apollo"
import { MainModel } from "app/(main)/works/images/models/[model]/components/MainModel"
import { client } from "app/client"

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
