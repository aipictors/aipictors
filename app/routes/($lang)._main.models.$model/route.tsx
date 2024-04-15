import { ModelHeader } from "@/[lang]/(main)/models/[model]/_components/model-header"
import { WorkList } from "@/[lang]/(main)/works/_components/work-list"
import { AppPage } from "@/_components/app/app-page"
import { imageModelQuery } from "@/_graphql/queries/image-model/image-model"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.model === undefined) {
    throw new Response(null, { status: 404 })
  }

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
  return {
    resp: resp.data,
    worksResp: worksResp.data,
  }
}

/**
 * モデルの詳細
 * @param props
 * @returns
 */
export default function Model() {
  const params = useParams()

  if (params.resp === undefined) {
    throw new Error()
  }

  if (params.worksResp === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <ModelHeader imageModelQuery={data.resp} />
      <WorkList works={data.worksResp.works ?? []} />
    </AppPage>
  )
}
