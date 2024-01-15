import { UserWorkList } from "@/app/[lang]/(main)/users/[user]/_components/user-work-list"
import { UserWorkListActions } from "@/app/[lang]/(main)/users/[user]/_components/user-work-list-actions"
import { createClient } from "@/app/_contexts/client"
import type {
  UserWorksQuery,
  UserWorksQueryVariables,
} from "@/graphql/__generated__/graphql"
import { userWorksQuery } from "@/graphql/queries/user/user-works"
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

export const revalidate = 60

export default UserPage
