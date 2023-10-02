import type { Metadata } from "next"
import type {
  StickersQuery,
  UserQuery,
  UserWorksQuery,
  UserWorksQueryVariables,
} from "__generated__/apollo"
import {
  StickersDocument,
  UserDocument,
  UserWorksDocument,
} from "__generated__/apollo"
import { UserProfile } from "app/(main)/users/[user]/components/UserProfile"
import { UserProfileHeader } from "app/(main)/users/[user]/components/UserProfileHeader"
import { UserTabs } from "app/(main)/users/[user]/components/UserTabs"
import { client } from "app/client"
import { MainPage } from "app/components/MainPage"

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

  const userQuery = await client.query<UserQuery>({
    query: UserDocument,
    variables: {
      userId: "1",
    },
  })

  const stickersQuery = await client.query<StickersQuery>({
    query: StickersDocument,
    variables: {
      offset: 0,
      limit: 256,
    },
  })

  if (userQuery.data.user === null) {
    return <div>404</div>
  }

  return (
    <MainPage>
      <UserProfileHeader user={userQuery.data.user} />
      <UserProfile user={userQuery.data.user} />
      <UserTabs
        works={worksQuery.data.user?.works ?? []}
        user={userQuery.data.user}
        stickersQuery={stickersQuery.data}
      />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserPage
