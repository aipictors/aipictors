import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  UserAlbumList,
  UserAlbumListItemFragment,
} from "~/routes/($lang)._main.users.$user.albums/components/user-album-list"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const userIdResp = await loaderClient.query({
    query: userIdQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userIdResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  const albumsResp = await loaderClient.query({
    query: userAlbumsQuery,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        ownerUserId: userIdResp.data.user.id,
        ratings: ["R18", "R18G"],
        isSensitive: true,
        needInspected: false,
        // 作品がすべて削除・非公開のシリーズは除く（タブの数字と同じ条件）
        hasWorks: true,
      },
    },
  })

  return {
    albums: albumsResp.data.albums,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UserAlbums() {
  const data = useLoaderData<typeof loader>()

  if (data.albums === null) {
    return
  }

  return <UserAlbumList albums={data.albums} />
}

export const userAlbumsQuery = graphql(
  `query UserAlbums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput!) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...UserAlbumListItem
    }
  }`,
  [UserAlbumListItemFragment],
)

const userIdQuery = graphql(
  `query UserId($userId: ID!) {
    user(id: $userId) {
      id
    }
  }`,
)
