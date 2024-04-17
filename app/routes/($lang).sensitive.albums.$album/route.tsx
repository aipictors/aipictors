import { AlbumArticleHeader } from "@/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/[lang]/(main)/albums/[album]/_components/album-work-list"
import { AppPage } from "@/_components/app/app-page"
import { albumQuery } from "@/_graphql/queries/album/album"
import { albumWorksQuery } from "@/_graphql/queries/album/album-works"
import { createClient } from "@/_lib/client"
import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"

export const loader = async (props: LoaderFunctionArgs) => {
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

  return {
    album: albumResp.data.album,
    albumWorks: albumWorksResp.data.album?.works ?? [],
  }
}

export default function SensitiveAlbumPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <article className="flex">
        <div className="flex flex-col">
          <AlbumArticleHeader album={data.album} />
          <AlbumWorkList albumWorks={data.albumWorks} />
        </div>
        <AlbumWorkDescription album={data.album} />
      </article>
    </AppPage>
  )
}
