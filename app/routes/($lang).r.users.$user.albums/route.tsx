import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  UserAlbumList,
  UserAlbumListItemFragment,
} from "~/routes/($lang)._main.users.$user.albums/components/user-album-list"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const albumsResp = await loaderClient.query({
    query: userAlbumsQuery,
    variables: {
      offset: 0,
      limit: 32,
      userId: props.params.user,
    },
  })

  return json({
    albums: albumsResp.data.albums,
  })
}

export default function UserAlbums() {
  const data = useLoaderData<typeof loader>()

  if (data.albums === null) {
    return
  }

  return (
    <div className="flex flex-col space-y-4">
      <UserAlbumList albums={data.albums} />
    </div>
  )
}

export const userAlbumsQuery = graphql(
  `query UserAlbums($offset: Int!, $limit: Int!) {
    albums(offset: $offset, limit: $limit) {
      ...UserAlbumListItem
    }
  }`,
  [UserAlbumListItemFragment],
)
