import type { Metadata } from "next"
import { UserProfile } from "app/(main)/users/components/UserProfile"

const UserPage = async () => {
  return <UserProfile />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserPage
