import type { Metadata } from "next"
import type { ImageModelQuery } from "__generated__/apollo"
import { ImageModelDocument } from "__generated__/apollo"
import { ModelList } from "app/(main)/works/models/[model]/components/ModelList"
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

  return <ModelList imageModelQuery={resp.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingModelsPage
