import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { UserContentHeader } from "~/routes/($lang)._main.users.$user._index/components/user-content-header"
import { UserAlbumListItemFragment } from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content"
import { UserSensitiveAlbumsContentBody } from "~/routes/($lang).r.users.$user.albums/components/user-sensitive-albums-content-body"

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

  if (albumsResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    user: albumsResp.data.user,
    albums: albumsResp.data.user.albums,
  })
}

export default function UserSensitiveAlbums() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex w-full flex-col justify-center">
      <UserContentHeader user={data.user} />
      <UserSensitiveAlbumsContentBody user={data.user} albums={data.albums} />
    </div>
  )
}

export const userAlbumsQuery = graphql(
  `query UserAlbums($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      albums(offset: $offset, limit: $limit) {
        ...UserAlbumListItem
      }
      ...UserProfileIcon
    }
  }`,
  [UserAlbumListItemFragment, UserProfileIconFragment],
)
