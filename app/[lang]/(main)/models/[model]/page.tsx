import type { ImageModelQuery, WorksQuery } from "@/__generated__/apollo"
import { ImageModelDocument, WorksDocument } from "@/__generated__/apollo"
import { ModelHeader } from "@/app/[lang]/(main)/models/[model]/_components/model-header"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { MainPage } from "@/app/_components/page/main-page"
import { createClient } from "@/app/_contexts/client"
import type { Metadata } from "next"

type Props = {
  params: {
    model: string
  }
}

/**
 * モデルの詳細
 * @param props
 * @returns
 */
const ModelPage = async (props: Props) => {
  const client = createClient()

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
