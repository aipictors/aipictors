import { UserWorkList } from "@/[lang]/(main)/users/[user]/_components/user-work-list"
import { UserWorkListActions } from "@/[lang]/(main)/users/[user]/_components/user-work-list-actions"
import { userWorksQuery } from "@/_graphql/queries/user/user-works"
import { createClient } from "@/_lib/client"
import type { Metadata } from "next"

type Props = {
  params: { user: string }
}

const UserPage = async (props: Props) => {
  const client = createClient()

  const worksResp = await client.query({
    query: userWorksQuery,
    variables: {
      offset: 0,
      limit: 16,
      userId: props.params.user,
    },
  })

  return (
    <>
      <UserWorkListActions />
      <UserWorkList works={worksResp.data.user?.works ?? []} />
    </>
  )
}

export const generateStaticParams = () => {
  return []
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default UserPage
