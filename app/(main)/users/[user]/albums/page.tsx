import type { Metadata } from "next"
import type {
  UserAlbumsQuery,
  UserAlbumsQueryVariables,
} from "__generated__/apollo"
import { UserAlbumsDocument } from "__generated__/apollo"
import { UserAlbumList } from "app/(main)/users/[user]/albums/components/UserAlbumList"
import { client } from "app/client"

const UserAlbumsPage = async () => {
  const albumsQuery = await client.query<
    UserAlbumsQuery,
    UserAlbumsQueryVariables
  >({
    query: UserAlbumsDocument,
    variables: {
      offset: 0,
      limit: 16,
      userId: "4321",
    },
  })
  return (
    <>
      <UserAlbumList albums={albumsQuery.data.user?.albums ?? []} />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserAlbumsPage
