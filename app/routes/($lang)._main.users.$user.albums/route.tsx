import { UserAlbumList } from "@/[lang]/(main)/users/[user]/albums/_components/user-album-list"
import { userAlbumsQuery } from "@/_graphql/queries/user/user-albums"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import type { Metadata } from "next"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const albumsResp = await client.query({
    query: userAlbumsQuery,
    variables: {
      offset: 0,
      limit: 16,
      userId: props.params.user,
    },
  })

  // metadataをコンポーネント内で定義
  const metadata: Metadata = {
    robots: { index: false },
    title: "-",
  }

  // revalidateをコンポーネント内で定義
  const revalidate = 60
  return {
    albums: albumsResp.data.user?.albums ?? [],
  }
}

export default function UserAlbums() {
  const params = useParams()

  if (params.albums === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return <UserAlbumList albums={data.albums} />
}
