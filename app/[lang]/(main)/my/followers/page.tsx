import { ViewerFollowerList } from "@/[lang]/(main)/my/followers/_components/viewer-follower-list"
import type { Metadata } from "next"

const MyFollowersPage = async () => {
  return <ViewerFollowerList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default MyFollowersPage
