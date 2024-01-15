import { AlbumArticleHeader } from "@/app/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type {
  AlbumQuery,
  AlbumQueryVariables,
  AlbumWorksQuery,
  AlbumWorksQueryVariables,
} from "@/graphql/__generated__/graphql"
import { albumQuery } from "@/graphql/queries/album/album"
import { albumWorksQuery } from "@/graphql/queries/album/album-works"
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

  const albumResp = await client.query<AlbumQuery, AlbumQueryVariables>({
    query: albumQuery,
    variables: {
      id: props.params.album,
    },
  })

  const albumWorksResp = await client.query<
    AlbumWorksQuery,
    AlbumWorksQueryVariables
  >({
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

export const revalidate = 60

export default AlbumPage
