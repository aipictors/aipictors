import type { UserQuery, UserQueryVariables } from "@/__generated__/apollo"
import { UserDocument } from "@/__generated__/apollo"
import UserProfile from "@/app/[lang]/(main)/users/[user]/_components/user-profile"

import { UserTabs } from "@/app/[lang]/(main)/users/[user]/_components/user-tabs"
import { MainPage } from "@/app/_components/page/main-page"
import { createClient } from "@/app/_contexts/client"
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
      <div className="flex flex-col w-full justify-center">
        <UserProfile userQuery={userQuery.data} />
        <main className="px-4 py-6 md:px-6 lg:py-16">
          <UserTabs params={props.params} />
        </main>
      </div>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default UserLayout
