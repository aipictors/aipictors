import {
  AlbumDocument,
  AlbumQuery,
  AlbumQueryVariables,
  AlbumWorksDocument,
  AlbumWorksQuery,
  AlbumWorksQueryVariables,
} from "@/__generated__/apollo"
import { AlbumArticleHeader } from "@/app/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

type Props = {
  params: {
    album: string
  }
}

const SensitiveAlbumPage = async (props: Props) => {
  const client = createClient()

  const albumQuery = await client.query<AlbumQuery, AlbumQueryVariables>({
    query: AlbumDocument,
    variables: {
      id: props.params.album,
    },
  })

  const albumWorksQuery = await client.query<
    AlbumWorksQuery,
    AlbumWorksQueryVariables
  >({
    query: AlbumWorksDocument,
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
          <AlbumArticleHeader albumQuery={albumQuery.data} />
          <AlbumWorkList albumWorksQuery={albumWorksQuery.data} />
        </div>
        <AlbumWorkDescription albumQuery={albumQuery.data} />
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

export default SensitiveAlbumPage
