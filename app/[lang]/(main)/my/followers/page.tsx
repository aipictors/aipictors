import { ViewerFollowerList } from "app/[lang]/(main)/my/followers/_components/viewer-follower-list"
import type { Metadata } from "next"

const MyFollowersPage = async () => {
  return <ViewerFollowerList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyFollowersPage
