import type { UserQuery, UserQueryVariables } from "__generated__/apollo"
import { UserDocument } from "__generated__/apollo"
import { UserSupport } from "app/[lang]/(main)/users/[user]/supports/_components/user-support"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

type Props = {
  params: { user: string }
}

const UserSupportsPage = async (props: Props) => {
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
    <>
      <UserSupport
        user={userQuery.data.user}
        userIconImageURL={userQuery.data.user.iconImage?.downloadURL ?? null}
        userName={userQuery.data.user.name}
      />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserSupportsPage
