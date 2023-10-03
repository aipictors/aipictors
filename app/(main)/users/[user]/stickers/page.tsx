import type { Metadata } from "next"
import type {
  UserStickersQuery,
  UserStickersQueryVariables,
} from "__generated__/apollo"
import { UserStickersDocument } from "__generated__/apollo"
import { UserWorkListActions } from "app/(main)/users/[user]/components/UserWorkListActions"
import { UserStickerList } from "app/(main)/users/[user]/stickers/components/UserStickerList"
import { client } from "app/client"

type Props = {
  params: { user: string }
}

const UserStickersPage = async (props: Props) => {
  const stickersQuery = await client.query<
    UserStickersQuery,
    UserStickersQueryVariables
  >({
    query: UserStickersDocument,
    variables: {
      userId: props.params.user,
      offset: 0,
      limit: 256,
    },
  })

  return (
    <>
      <UserWorkListActions />
      <UserStickerList stickers={stickersQuery.data.user?.stickers ?? []} />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserStickersPage
