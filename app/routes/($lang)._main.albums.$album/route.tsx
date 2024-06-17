import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { albumQuery } from "@/_graphql/queries/album/album"
import { albumWorksQuery } from "@/_graphql/queries/album/album-works"
import { createClient } from "@/_lib/client"
import { AlbumArticleHeader } from "@/routes/($lang)._main.albums.$album/_components/album-article-header"
import { AlbumWorkDescription } from "@/routes/($lang)._main.albums.$album/_components/album-work-description"
import { AlbumWorkList } from "@/routes/($lang)._main.albums.$album/_components/album-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

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
          <AlbumWorkList albumWorks={data.albumWorks} maxCount={0} />
        </div>
        <AlbumWorkDescription album={data.album} />
      </article>
    </AppPage>
  )
}
