import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import {
  UserAlbumList,
  UserAlbumListItemFragment,
} from "~/routes/($lang)._main.users.$user.albums/components/user-album-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "react-router"
import { useLoaderData } from "react-router"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const albumsResp = await loaderClient.query({
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
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return <UserAlbumList albums={data.albums} />
}

const userAlbumsQuery = graphql(
  `query UserAlbums($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      albums(offset: $offset, limit: $limit) {
        ...UserAlbumListItem
      }
    }
  }`,
  [UserAlbumListItemFragment],
)
