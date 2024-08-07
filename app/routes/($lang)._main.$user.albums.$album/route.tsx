import { IconUrl } from "~/components/icon-url"
import { ParamsError } from "~/errors/params-error"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import { albumArticleFragment } from "~/routes/($lang)._main.albums.$album/components/album-article-editor-dialog"
import { AlbumArticleHeader } from "~/routes/($lang)._main.albums.$album/components/album-article-header"
import { AlbumWorkList } from "~/routes/($lang)._main.albums.$album/components/album-work-list"
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
    query: userAlbumQuery,
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
    query: albumWorksQuery,
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
    album: albumResp.data.userAlbum,
    albumWorks: albumWorksResp.data.album.works,
  })
}

/**
 * シリーズの詳細
 */
export default function albums() {
  const params = useParams()

  if (params.album === undefined || params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  console.log(data)

  const work = data.albumWorks.length > 0 ? data.albumWorks[0] : null

  const thumbnail = data.album.thumbnailImageURL
    ? data.album.thumbnailImageURL
    : work?.largeThumbnailImageURL

  return (
    <>
      <article className="flex">
        <div className="flex w-full flex-col justify-center">
          <AlbumArticleHeader
            album={data.album}
            thumbnail={thumbnail}
            userLogin={data.album.user.login}
            userId={data.album.user.id}
            userName={data.album.user.name}
            userProfileImageURL={IconUrl(data.album.user.iconUrl)}
          />
        </div>
      </article>
      <AlbumWorkList
        albumId={data.album.id}
        albumWorks={data.albumWorks}
        maxCount={data.album.worksCount}
      />
    </>
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

const userAlbumQuery = graphql(
  `query userAlbum($where: UserAlbumWhereInput) {
    userAlbum( where: $where) {
      ...AlbumArticle
    }
  }`,
  [albumArticleFragment],
)
