import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import { AlbumArticleEditorDialogFragment } from "~/routes/($lang)._main.albums.$album/components/album-article-editor-dialog"
import {
  AlbumArticleHeader,
  AlbumArticleHeaderFragment,
} from "~/routes/($lang)._main.albums.$album/components/album-article-header"
import { AlbumWorkDescription } from "~/routes/($lang)._main.albums.$album/components/album-work-description"
import {
  AlbumWorkList,
  AlbumWorkListItemFragment,
} from "~/routes/($lang)._main.albums.$album/components/album-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.album === undefined) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

  const client = createClient()

  const result = await client.query({
    query: LoaderQuery,
    variables: {
      albumId: props.params.album,
      offset: 0,
      limit: 16,
    },
  })

  if (result.data.album === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    ...result.data,
    album: result.data.album,
    page: page,
  })
}

/**
 * シリーズの詳細
 */
export default function albums() {
  const params = useParams()

  if (params.album === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <article className="flex">
        <div className="flex flex-col">
          <AlbumArticleHeader album={data.album} />
          <AlbumWorkList
            albumWorks={data.album.works}
            maxCount={0}
            albumId={data.album.id}
            page={data.page}
          />
        </div>
        <AlbumWorkDescription album={data.album} />
      </article>
    </>
  )
}

const LoaderQuery = graphql(
  `query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...AlbumWorkListItem
      }
      ...AlbumArticleHeader
      ...AlbumArticleEditorDialog
    }
  }`,
  [
    AlbumArticleHeaderFragment,
    AlbumWorkListItemFragment,
    AlbumArticleEditorDialogFragment,
  ],
)
