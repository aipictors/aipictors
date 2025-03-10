import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { CollectionArticle } from "~/routes/($lang)._main.collections.$collection/components/collection-article"
import { CollectionWorkListItemFragment } from "~/routes/($lang)._main.collections.$collection/components/collection-works-list"
import { useLoaderData } from "@remix-run/react"
import { useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { config } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.collection === undefined) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)

  const searchParams = new URLSearchParams(url.search)

  const page = searchParams.get("page")
    ? Number.parseInt(searchParams.get("page") || "1", 10)
    : 0

  const collectionResp = await loaderClient.query({
    query: folderQuery,
    variables: {
      nanoid: props.params.collection,
      offset: page * 16,
      limit: 16,
    },
  })

  return {
    folderResp: collectionResp.data.folder,
    page: page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

/**
 * コレクションの詳細
 */
export default function Collections() {
  const params = useParams()

  if (params.collection === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data.folderResp === null) {
    throw new Response(null, { status: 404 })
  }

  return (
    <>
      <CollectionArticle collection={data.folderResp} page={data.page} />
    </>
  )
}

export const folderFragment = graphql(
  `fragment FolderArticle on FolderNode @_unmask {
    id
    thumbnailImageURL
    title
    description
    tags
    user {
      id
      name
      iconUrl
      login
    }
    worksCount
  }`,
)

const folderQuery = graphql(
  `query folder($nanoid: String!, $offset: Int!, $limit: Int!) {
    folder(where: { nanoid: $nanoid }) {
      ...FolderArticle
      works(offset: $offset, limit: $limit) {
        ...CollectionWorkListItem
      }
    }
  }`,
  [CollectionWorkListItemFragment, folderFragment],
)
