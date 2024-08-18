import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import {
  CollectionArticle,
  FolderArticleFragment,
} from "~/routes/($lang)._main.collections.$collection/components/collection-article"
import { json, useLoaderData } from "@remix-run/react"
import { useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.collection === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const collectionResp = await client.query({
    query: folderQuery,
    variables: {
      nanoid: props.params.collection,
    },
  })
  return json({
    folderResp: collectionResp.data.folder,
  })
}

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
      <CollectionArticle collection={data.folderResp} />
    </>
  )
}

const folderQuery = graphql(
  `query folder($nanoid: String!) {
    folder(where: { nanoid: $nanoid }) {
      ...FolderArticle
    }
  }`,
  [FolderArticleFragment],
)
