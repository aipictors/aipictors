import { AlbumArticleHeader } from "@/app/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-list"
import { AppPage } from "@/components/app/app-page"
import { albumQuery } from "@/graphql/queries/album/album"
import { albumWorksQuery } from "@/graphql/queries/album/album-works"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"

type Props = {
  params: {
    album: string
  }
}

const SensitiveAlbumPage = async (props: Props) => {
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

export const revalidate = 60

export default SensitiveAlbumPage
