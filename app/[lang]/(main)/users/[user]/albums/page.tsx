import { UserAlbumList } from "@/app/[lang]/(main)/users/[user]/albums/_components/user-album-list"
import { userAlbumsQuery } from "@/graphql/queries/user/user-albums"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"

type Props = {
  params: { user: string }
}

const UserAlbumsPage = async (props: Props) => {
  const client = createClient()

  const albumsResp = await client.query({
    query: userAlbumsQuery,
    variables: {
      offset: 0,
      limit: 16,
      userId: props.params.user,
    },
  })

  // metadataをコンポーネント内で定義
  const metadata: Metadata = {
    robots: { index: false },
    title: "-",
  }

  // revalidateをコンポーネント内で定義
  const revalidate = 60

  return (
    <>
      <UserAlbumList albums={albumsResp.data.user?.albums ?? []} />
    </>
  )
}

// export const metadata: Metadata = {
//   robots: { index: false },
//   title: "-",
// }

// export const revalidate = 60

export default UserAlbumsPage
