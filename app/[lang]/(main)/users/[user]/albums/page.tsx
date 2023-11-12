import { UserAlbumList } from "@/app/[lang]/(main)/users/[user]/albums/_components/user-album-list"
import { createClient } from "@/app/_contexts/client"
import type {
  UserAlbumsQuery,
  UserAlbumsQueryVariables,
} from "@/__generated__/apollo"
import { UserAlbumsDocument } from "@/__generated__/apollo"
import type { Metadata } from "next"

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
