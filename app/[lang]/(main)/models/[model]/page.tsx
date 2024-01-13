import type { ImageModelQuery, WorksQuery } from "@/__generated__/apollo"
import { ImageModelDocument, WorksDocument } from "@/__generated__/apollo"
import { ModelHeader } from "@/app/[lang]/(main)/models/[model]/_components/model-header"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
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
    <AppPage>
      <ModelHeader imageModelQuery={resp.data} />
      <WorkList works={worksQuery.data.works ?? []} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default ModelPage
