import type { Metadata } from "next"
import type {
  UserAlbumsQuery,
  UserAlbumsQueryVariables,
} from "__generated__/apollo"
import { UserAlbumsDocument } from "__generated__/apollo"
import { UserAlbumList } from "app/(main)/users/[user]/albums/components/UserAlbumList"
import { createClient } from "app/client"

type Props = {
  params: { user: string }
}

const UserAlbumsPage = async (props: Props) => {
  const client = createClient()

  const albumsQuery = await client.query<
    UserAlbumsQuery,
    UserAlbumsQueryVariables
  >({
    query: UserAlbumsDocument,
    variables: {
      offset: 0,
      limit: 16,
      userId: props.params.user,
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
