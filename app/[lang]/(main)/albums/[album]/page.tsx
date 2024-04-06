import { AlbumArticleHeader } from "@/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/[lang]/(main)/albums/[album]/_components/album-work-list"
import { AppPage } from "@/_components/app/app-page"
import { albumQuery } from "@/_graphql/queries/album/album"
import { albumWorksQuery } from "@/_graphql/queries/album/album-works"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"

type Props = {
  params: {
    album: string
  }
}

/**
 * シリーズの詳細
 * @returns
 */
const AlbumPage = async (props: Props) => {
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

  return (
    <AppPage>
      <article className="flex">
        <div className="flex flex-col">
          <AlbumArticleHeader albumQuery={albumResp.data} />
          <AlbumWorkList albumWorksQuery={albumWorksResp.data} />
        </div>
        <AlbumWorkDescription albumQuery={albumResp.data} />
      </article>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export default AlbumPage
