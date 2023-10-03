import type { Metadata } from "next"
import type {
  UserWorksQuery,
  UserWorksQueryVariables,
} from "__generated__/apollo"
import { UserWorksDocument } from "__generated__/apollo"
import { UserWorkList } from "app/(main)/users/[user]/components/UserWorkList"
import { UserWorkListActions } from "app/(main)/users/[user]/components/UserWorkListActions"
import { client } from "app/client"

const UserPage = async () => {
  const worksQuery = await client.query<
    UserWorksQuery,
    UserWorksQueryVariables
  >({
    query: UserWorksDocument,
    variables: {
      offset: 0,
      limit: 16,
      userId: "1",
    },
  })

  return (
    <>
      <UserWorkListActions />
      <UserWorkList works={worksQuery.data.user?.works ?? []} />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserPage
