import type { Metadata } from "next"
import type {
  UserQuery,
  UserQueryVariables,
  UserWorksQuery,
  UserWorksQueryVariables,
} from "__generated__/apollo"
import { UserDocument, UserWorksDocument } from "__generated__/apollo"
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
      userId: "4321",
    },
  })

  const userQuery = await client.query<UserQuery, UserQueryVariables>({
    query: UserDocument,
    variables: {
      userId: "4321",
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
