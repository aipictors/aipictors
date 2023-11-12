import { ViewerFolloweeList } from "@/app/[lang]/(main)/my/followees/_components/viewer-followee-list"
import type { Metadata } from "next"

const MyFolloweesPage = async () => {
  return <ViewerFolloweeList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyFolloweesPage
