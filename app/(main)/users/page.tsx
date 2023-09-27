import type { Metadata } from "next"
import { UserProfile } from "app/(main)/users/components/UserProfile"
import { UserProfileHeader } from "app/(main)/users/components/UserProfileHeader"
import { UserProfileWorks } from "app/(main)/users/components/UserProfileWorks"
import { MainPage } from "app/components/MainPage"

const UserPage = async () => {
  return (
    <MainPage>
      <UserProfileHeader />
      <UserProfile />
      <UserProfileWorks />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserPage
