import { ArticlePage } from "~/components/page/article-page"
import { loaderClient } from "~/lib/loader-client"
import {
  imageModelCardFragment,
  ImageModelList,
} from "~/routes/($lang)._main.models._index/components/image-model-list"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

/**
 * モデルの一覧
 */
export async function loader() {
  const resp = await loaderClient.query({
    query: imageModelsQuery,
    variables: {
      limit: 64,
      offset: 0,
    },
  })

  return json({
    imageModels: resp.data.imageModels,
  })
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.MODELS, undefined, props.params.lang)
}

export default function ModelsPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <ArticlePage>
      <ImageModelList imageModels={data.imageModels} />
    </ArticlePage>
  )
}

const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      ...ImageModelCard
    }
  }`,
  [imageModelCardFragment],
)
