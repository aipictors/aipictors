import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import {
  AlbumArticleHeader,
  AlbumArticleHeaderFragment,
} from "~/routes/($lang)._main.albums.$album/components/album-article-header"
import {
  AlbumWorkList,
  AlbumWorkListItemFragment,
} from "~/routes/($lang)._main.albums.$album/components/album-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.album === undefined || props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const albumResp = await client.query({
    query: LoaderQuery__DEPRECATED__,
    variables: {
      where: {
        userId: props.params.user,
        link: props.params.album,
      },
    },
  })

  if (albumResp.data.userAlbum === null) {
    throw new Response(null, { status: 404 })
  }

  const albumId = albumResp.data.userAlbum.id

  const albumWorksResp = await client.query({
    query: LoaderQuery,
    variables: {
      albumId: albumId,
      offset: 0,
      limit: 32,
    },
  })

  if (albumWorksResp.data.album === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    userAlbum: albumResp.data.userAlbum,
    album: albumWorksResp.data.album,
  })
}

/**
 * シリーズの詳細
 */
export default function Route() {
  const params = useParams()

  if (params.album === undefined || params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  const [work = null] = data.album.works

  const thumbnail = data.userAlbum.thumbnailImageURL
    ? data.userAlbum.thumbnailImageURL
    : work?.largeThumbnailImageURL

  return (
    <>
      <article className="flex">
        <div className="flex w-full flex-col justify-center">
          <AlbumArticleHeader album={data.userAlbum} thumbnail={thumbnail} />
        </div>
      </article>
      <AlbumWorkList
        albumId={data.userAlbum.id}
        albumWorks={data.album.works}
        maxCount={data.userAlbum.worksCount}
      />
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
    }
  }`,
  [AlbumWorkListItemFragment, AlbumArticleHeaderFragment],
)

const LoaderQuery__DEPRECATED__ = graphql(
  `query userAlbum($where: UserAlbumWhereInput) {
    userAlbum( where: $where) {
      ...AlbumArticleHeader
    }
  }`,
  [AlbumArticleHeaderFragment],
)
