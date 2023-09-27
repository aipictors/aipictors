import type { Metadata } from "next"
import { UserProfile } from "app/(main)/users/[user]/components/UserProfile"
import { UserProfileHeader } from "app/(main)/users/[user]/components/UserProfileHeader"
import { UserWorkList } from "app/(main)/users/[user]/components/UserWorkList"
import { MainPage } from "app/components/MainPage"

const UserPage = async () => {
  return (
    <MainPage>
      <UserProfileHeader />
      <UserProfile />
      <UserWorkList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserPage
