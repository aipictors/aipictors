import { Metadata } from "next"
import { MainViewerFollowers } from "app/viewer/followers/components/MainViewerFollowers"

const SettingViewerFollowersPage = async () => {
  return <MainViewerFollowers />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingViewerFollowersPage
