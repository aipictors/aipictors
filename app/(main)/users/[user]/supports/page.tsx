import type { Metadata } from "next"
import type { UserQuery, UserQueryVariables } from "__generated__/apollo"
import { UserDocument } from "__generated__/apollo"
import { UserSupport } from "app/(main)/users/[user]/supports/components/UserSupport"
import { client } from "app/client"

const UserSupportsPage = async () => {
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
    <>
      <UserSupport user={userQuery.data.user} userIconImageURL="" userName="" />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserSupportsPage
