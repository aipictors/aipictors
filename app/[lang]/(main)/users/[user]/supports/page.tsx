import { UserSupport } from "@/app/[lang]/(main)/users/[user]/supports/_components/user-support"
import { userQuery } from "@/graphql/queries/user/user"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: { user: string }
}

const UserSupportsPage = async (props: Props) => {
  const client = createClient()

  const userResp = await client.query({
    query: userQuery,
    variables: {
      userId: props.params.user,
    },
  })

  const metadata: Metadata = {
    robots: { index: false },
    title: "-",
  }

  const revalidate = 60

  if (userResp.data.user === null) {
    return notFound
  }

  return (
    <>
      <UserSupport
        user={userResp.data.user}
        userIconImageURL={userResp.data.user.iconImage?.downloadURL ?? null}
        userName={userResp.data.user.name}
      />
    </>
  )
}

// export const metadata: Metadata = {
//   robots: { index: false },
//   title: "-",
// }

export default UserSupportsPage
