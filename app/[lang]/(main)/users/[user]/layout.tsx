import UserProfile from "@/app/[lang]/(main)/users/[user]/_components/user-profile"
import { UserTabs } from "@/app/[lang]/(main)/users/[user]/_components/user-tabs"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import { userQuery } from "@/graphql/queries/user/user"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  children: React.ReactNode
  params: { user: string }
}

const UserLayout = async (props: Props) => {
  const client = createClient()

  const userResp = await client.query({
    query: userQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
    },
  })

  if (userResp.data.user === null) {
    return notFound()
  }

  return (
    <AppPage>
      <div className="flex flex-col w-full justify-center">
        <UserProfile user={userResp.data.user} />
        <main className="px-4 py-6 md:px-6 lg:py-16">
          <UserTabs params={props.params} />
        </main>
      </div>
    </AppPage>
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
