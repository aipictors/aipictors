import type { UserQuery, UserQueryVariables } from "@/__generated__/apollo"
import { UserDocument } from "@/__generated__/apollo"
import { UserProfileAvatar } from "@/app/[lang]/(main)/users/[user]/_components/user-profile-avatar"
import { UserProfileHeader } from "@/app/[lang]/(main)/users/[user]/_components/user-profile-header"
import { UserTabs } from "@/app/[lang]/(main)/users/[user]/_components/user-tabs"
import { FollowButton } from "@/app/_components/button/follow-button"
import { MainPage } from "@/app/_components/page/main-page"
import { createClient } from "@/app/_contexts/client"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { RiEye2Line, RiHeartLine } from "react-icons/ri"
import { UserProfileInfo } from "./_components/user-profile"

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
        <header className="relative h-64">
          {/* <UserProfileHeader
            headerImageUrl={userQuery.data.user.headerImage?.downloadURL}
          /> */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-4 py-6 bg-gradient-to-t from-background/40">
            <div className="flex items-center gap-4">
              <UserProfileAvatar
                alt={userQuery.data.user.name}
                src={userQuery.data.user.iconImage?.downloadURL}
              />
              <UserProfileInfo
                name={userQuery.data.user.name}
                receivedLikesCount={userQuery.data.user.receivedLikesCount}
                receivedViewsCount={userQuery.data.user.receivedViewsCount}
                awardsCount={userQuery.data.user.awardsCount}
                followersCount={userQuery.data.user.followersCount}
                biography={userQuery.data.user.biography || ""} // nullの場合は空文字列に設定
              />
            </div>
            <FollowButton />
          </div>
        </header>
        <main className="px-4 py-6 md:px-6 lg:py-16">
          <UserTabs userId={props.params.user} />
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
