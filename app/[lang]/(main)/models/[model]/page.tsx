import { ModelHeader } from "@/app/[lang]/(main)/models/[model]/_components/model-header"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { AppPage } from "@/components/app/app-page"
import { imageModelQuery } from "@/graphql/queries/image-model/image-model"
import { worksQuery } from "@/graphql/queries/work/works"
import { createClient } from "@/lib/client"
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

  const resp = await client.query({
    query: imageModelQuery,
    variables: {
      id: props.params.model,
    },
  })

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })

  return (
    <AppPage>
      <ModelHeader imageModelQuery={resp.data} />
      <WorkList works={worksResp.data.works ?? []} />
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

export default ModelPage
