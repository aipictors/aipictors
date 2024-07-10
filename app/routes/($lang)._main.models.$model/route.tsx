import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { imageModelQuery } from "@/_graphql/queries/image-model/image-model"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { ModelHeader } from "@/routes/($lang)._main.models.$model/_components/model-header"
import { WorkList } from "@/routes/($lang)._main.posts._index/_components/work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
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

  return json({
    imageModel: resp.data.imageModel,
    works: worksResp.data.works,
  })
}

/**
 * モデルの詳細
 */
export default function ModelPage() {
  const params = useParams()

  if (params.model === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <ModelHeader imageModel={data.imageModel} />
      <WorkList works={data.works} />
    </AppPage>
  )
}
