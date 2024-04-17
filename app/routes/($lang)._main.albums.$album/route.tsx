import { AlbumArticleHeader } from "@/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/[lang]/(main)/albums/[album]/_components/album-work-list"
import { AppPage } from "@/_components/app/app-page"
import { albumQuery } from "@/_graphql/queries/album/album"
import { albumWorksQuery } from "@/_graphql/queries/album/album-works"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
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
  return {
    albumResp: albumResp.data,
    albumWorksResp: albumWorksResp.data,
  }
}

/**
 * シリーズの詳細
 * @returns
 */
export default function albums() {
  const params = useParams()

  if (params.album === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <article className="flex">
        <div className="flex flex-col">
          <AlbumArticleHeader album={data.albumResp} />
          <AlbumWorkList albumWorks={data.albumWorksResp} />
        </div>
        <AlbumWorkDescription album={data.albumResp} />
      </article>
    </AppPage>
  )
}
