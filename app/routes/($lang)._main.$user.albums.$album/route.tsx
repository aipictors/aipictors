import { AppPage } from "@/_components/app/app-page"
import { IconUrl } from "@/_components/icon-url"
import { ParamsError } from "@/_errors/params-error"
import { albumWorksQuery } from "@/_graphql/queries/album/album-works"
import { userAlbumQuery } from "@/_graphql/queries/album/user-album"
import { createClient } from "@/_lib/client"
import { AlbumArticleHeader } from "@/routes/($lang)._main.albums.$album/_components/album-article-header"
import { AlbumWorkList } from "@/routes/($lang)._main.albums.$album/_components/album-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

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
    <AppPage>
      <article className="flex">
        <div className="m-auto flex flex-col justify-center">
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
    </AppPage>
  )
}
