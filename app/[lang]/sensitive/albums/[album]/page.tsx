import {
  AlbumDocument,
  AlbumQuery,
  AlbumQueryVariables,
  AlbumWorksDocument,
  AlbumWorksQuery,
  AlbumWorksQueryVariables,
} from "@/__generated__/apollo"
import { SensitiveAlbumArticle } from "@/app/[lang]/sensitive/albums/[album]/_components/sensitive-album-article"

import { MainPage } from "@/app/_components/page/main-page"
import { createClient } from "@/app/_contexts/client"
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
    <MainPage>
      <SensitiveAlbumArticle
        albumQuery={albumQuery.data}
        albumWorksQuery={albumWorksQuery.data}
      />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveAlbumPage
