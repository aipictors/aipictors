import { MainViewerFollowees } from "app/[lang]/(main)/viewer/followees/components/MainViewerFollowees"
import type { Metadata } from "next"

const ViewerFolloweesPage = async () => {
  return <MainViewerFollowees />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerFolloweesPage
