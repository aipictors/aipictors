import type { UserQuery, UserQueryVariables } from "__generated__/apollo"
import { UserDocument } from "__generated__/apollo"
import { UserProfile } from "app/[lang]/(main)/users/[user]/_components/UserProfile"
import { UserProfileHeader } from "app/[lang]/(main)/users/[user]/_components/UserProfileHeader"
import { UserTabs } from "app/[lang]/(main)/users/[user]/_components/UserTabs"
import { MainPage } from "app/_components/MainPage"
import { createClient } from "app/_utils/client"
import type { Metadata } from "next"

type Props = {
  children: React.ReactNode
  params: { user: string }
}

const UserLayout = async (props: Props) => {
  const client = createClient()

  const userQuery = await client.query<UserQuery, UserQueryVariables>({
    query: UserDocument,
    variables: {
      userId: props.params.user,
    },
  })

  if (userQuery.data.user === null) {
    return <div>404</div>
  }

  return (
    <MainPage>
      <UserProfileHeader user={userQuery.data.user} />
      <UserProfile
        user={userQuery.data.user}
        userName={userQuery.data.user.name}
        userIconImageURL={userQuery.data.user.iconImage?.downloadURL ?? null}
        userReceivedLikesCount={userQuery.data.user.receivedLikesCount}
        userReceivedViewsCount={userQuery.data.user.receivedViewsCount}
        userFollowersCount={userQuery.data.user.followersCount}
        userAwardsCount={userQuery.data.user.awardsCount}
        userBiography={userQuery.data.user.biography}
      />
      <UserTabs userId={props.params.user} />
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
