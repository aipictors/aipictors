import { MainViewerFollowers } from "app/[lang]/(main)/viewer/followers/components/MainViewerFollowers"
import type { Metadata } from "next"

const ViewerFollowersPage = async () => {
  return <MainViewerFollowers />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerFollowersPage
