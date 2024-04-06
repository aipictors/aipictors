import { ViewerFolloweeList } from "@/[lang]/(main)/my/followees/_components/viewer-followee-list"
import type { Metadata } from "next"

const MyFolloweesPage = async () => {
  return <ViewerFolloweeList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default MyFolloweesPage
