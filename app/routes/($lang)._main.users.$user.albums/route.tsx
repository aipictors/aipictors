import { loaderClient } from "~/lib/loader-client"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams, useRevalidator } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import {
  UserAlbumList,
  UserAlbumListItemFragment,
} from "~/routes/($lang)._main.users.$user.albums/components/user-album-list"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { CreateAlbumDialog } from "~/routes/($lang).my._index/components/create-album-dialog"
import { Button } from "~/components/ui/button"
import { PlusIcon } from "lucide-react"

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
        needInspected: false,
      },
    },
  })

  return {
    ownerLogin: decodeURIComponent(props.params.user),
    albums: albumsResp.data.albums,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function UserAlbums () {
  const authContext = useContext(AuthContext)
  const params = useParams()
  const revalidator = useRevalidator()
  const data = useLoaderData<typeof loader>()

  const ownerLogin = params.user ? decodeURIComponent(params.user) : data.ownerLogin
  const isOwnAlbumsPage = authContext.isLoggedIn && authContext.login === ownerLogin

  const albums = data.albums

  if (albums === null) {
    return
  }

  return (
    <div className="flex flex-col space-y-4">
      {isOwnAlbumsPage && (
        <div className="flex justify-end">
          <CreateAlbumDialog
            refetch={() => {
              revalidator.revalidate()
            }}
          >
            <Button className="gap-2">
              <PlusIcon className="size-4" />
              シリーズを作成
            </Button>
          </CreateAlbumDialog>
        </div>
      )}
      <UserAlbumList albums={albums} />
    </div>
  )
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
