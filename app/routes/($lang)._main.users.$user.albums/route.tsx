import { ParamsError } from "@/_errors/params-error"
import { userAlbumsQuery } from "@/_graphql/queries/user/user-albums"
import { createClient } from "@/_lib/client"
import { UserAlbumList } from "@/routes/($lang)._main.users.$user.albums/_components/user-album-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

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

  return json({
    albums: albumsResp.data.user.albums,
  })
}

export default function UserAlbums() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return <UserAlbumList albums={data.albums} />
}
