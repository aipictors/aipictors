import { UserAlbumList } from "@/[lang]/(main)/users/[user]/albums/_components/user-album-list"
import { userAlbumsQuery } from "@/_graphql/queries/user/user-albums"
import { createClient } from "@/_lib/client"
import { ClientParamsError } from "@/errors/client-params-error"
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

  if (albumsResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    albums: albumsResp.data.user.albums,
  }
}

export default function UserAlbums() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ClientParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return <UserAlbumList albums={data.albums} />
}
