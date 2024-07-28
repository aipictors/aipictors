import { AppPage } from "~/components/app/app-page"
import { ParamsError } from "~/errors/params-error"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import { albumArticleFragment } from "~/routes/($lang)._main.albums.$album/components/album-article-editor-dialog"
import { AlbumArticleHeader } from "~/routes/($lang)._main.albums.$album/components/album-article-header"
import { AlbumWorkDescription } from "~/routes/($lang)._main.albums.$album/components/album-work-description"
import { AlbumWorkList } from "~/routes/($lang)._main.albums.$album/components/album-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.album === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const albumResp = await client.query({
    query: albumQuery,
    variables: {
      id: props.params.album,
    },
  })

  const albumWorksResp = await client.query({
    query: albumWorksQuery,
    variables: {
      albumId: props.params.album,
      offset: 0,
      limit: 16,
    },
  })

  if (albumResp.data.album === null) {
    throw new Response(null, { status: 404 })
  }

  if (albumWorksResp.data.album === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    album: albumResp.data.album,
    albumWorks: albumWorksResp.data.album.works,
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
    <AppPage>
      <article className="flex">
        <div className="flex flex-col">
          <AlbumArticleHeader
            album={data.album}
            userLogin={""}
            userId={""}
            userName={""}
            userProfileImageURL={""}
          />
          <AlbumWorkList
            albumWorks={data.albumWorks}
            maxCount={0}
            albumId={data.album.id}
          />
        </div>
        <AlbumWorkDescription album={data.album} />
      </article>
    </AppPage>
  )
}

const albumWorksQuery = graphql(
  `query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)

const albumQuery = graphql(
  `query Album($id: ID!) {
    album(id: $id) {
      ...AlbumArticle
    }
  }`,
  [albumArticleFragment],
)
