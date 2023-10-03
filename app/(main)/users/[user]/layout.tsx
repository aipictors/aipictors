import type { Metadata } from "next"
import type { UserQuery, UserQueryVariables } from "__generated__/apollo"
import { UserDocument } from "__generated__/apollo"
import { UserProfile } from "app/(main)/users/[user]/components/UserProfile"
import { UserProfileHeader } from "app/(main)/users/[user]/components/UserProfileHeader"
import { UserTabs } from "app/(main)/users/[user]/components/UserTabs"
import { client } from "app/client"
import { MainPage } from "app/components/MainPage"

type Props = {
  children: React.ReactNode
}

const UserLayout = async (props: Props) => {
  const userQuery = await client.query<UserQuery, UserQueryVariables>({
    query: UserDocument,
    variables: {
      userId: "1",
    },
  })

  if (userQuery.data.user === null) {
    return <div>404</div>
  }

  return (
    <MainPage>
      <UserProfileHeader user={userQuery.data.user} />
      <UserProfile user={userQuery.data.user} />
      <UserTabs />
      {props.children}
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserLayout
