import type { Metadata } from "next"
import type { ImageModelQuery, WorksQuery } from "__generated__/apollo"
import { ImageModelDocument, WorksDocument } from "__generated__/apollo"
import { ModelHeader } from "app/(main)/models/[model]/components/ModelHeader"
import { WorkList } from "app/(main)/works/components/WorkList"
import { client } from "app/client"
import { MainPage } from "app/components/MainPage"

type Props = {
  params: {
    model: string
  }
}

const ModelPage = async (props: Props) => {
  const resp = await client.query<ImageModelQuery>({
    query: ImageModelDocument,
    variables: {
      id: props.params.model,
    },
  })

  const worksQuery = await client.query<WorksQuery>({
    query: WorksDocument,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  return (
    <MainPage>
      <ModelHeader imageModelQuery={resp.data} />
      <WorkList works={worksQuery.data.works ?? []} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ModelPage
