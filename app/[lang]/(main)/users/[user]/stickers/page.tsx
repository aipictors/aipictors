import { UserWorkListActions } from "@/app/[lang]/(main)/users/[user]/_components/user-work-list-actions"
import { UserStickerList } from "@/app/[lang]/(main)/users/[user]/stickers/_components/user-sticker-list"
import { createClient } from "@/app/_contexts/client"
import { userStickersQuery } from "@/graphql/queries/user/user-stickers"
import type { Metadata } from "next"

type Props = {
  params: { user: string }
}

const UserStickersPage = async (props: Props) => {
  const client = createClient()

  const stickersResp = await client.query({
    query: userStickersQuery,
    variables: {
      userId: props.params.user,
      offset: 0,
      limit: 256,
    },
  })

  return (
    <>
      <UserWorkListActions />
      <UserStickerList stickers={stickersResp.data.user?.stickers ?? []} />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserStickersPage
