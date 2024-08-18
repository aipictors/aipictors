import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import {
  imageModelHeaderFragment,
  ModelHeader,
} from "~/routes/($lang)._main.models.$model/components/model-header"
import {
  WorkList,
  WorkListItemFragment,
} from "~/routes/($lang)._main.posts._index/components/work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

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
    <>
      <ModelHeader imageModel={data.imageModel} />
      <WorkList works={data.works} />
    </>
  )
}

const imageModelQuery = graphql(
  `query ImageModel($id: ID!) {
    imageModel(id: $id) {
      ...ImageModelHeader
    }
  }`,
  [imageModelHeaderFragment],
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...WorkListItem
    }
  }`,
  [WorkListItemFragment],
)
