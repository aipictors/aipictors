import { ParamsError } from "~/errors/params-error"
import { partialAlbumFieldsFragment } from "~/graphql/fragments/partial-album-fields"
import { createClient } from "~/lib/client"
import { UserAlbumList } from "~/routes/($lang)._main.users.$user.albums/components/user-album-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

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

const userAlbumsQuery = graphql(
  `query UserAlbums($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }`,
  [partialAlbumFieldsFragment],
)
