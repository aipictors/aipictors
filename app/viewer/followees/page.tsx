import { Metadata } from "next"
import { MainViewerFollowees } from "app/viewer/followees/components/MainViewerFollowees"

const SettingViewerFolloweesPage = async () => {
  return <MainViewerFollowees />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingViewerFolloweesPage
