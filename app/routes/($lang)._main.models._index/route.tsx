import { ArticlePage } from "~/components/page/article-page"
import { loaderClient } from "~/lib/loader-client"
import {
  imageModelCardFragment,
  ImageModelList,
} from "~/routes/($lang)._main.models._index/components/image-model-list"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"

/**
 * モデルの一覧
 */
export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const resp = await loaderClient.query({
    query: imageModelsQuery,
    variables: {
      limit: 64,
      offset: 0,
    },
  })

  return {
    imageModels: resp.data.imageModels,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.MODELS, undefined, props.params.lang)
}

export default function ModelsPage() {
  const data = useLoaderData<typeof loader>()

  if (data == null) {
    return null
  }

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
