import type { Metadata } from "next"
import { MainSettingMuteTags } from "app/(main)/settings/mute/tags/components/MainSettingMuteTags"

const SettingMuteTagsPage = async () => {
  return <MainSettingMuteTags />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingMuteTagsPage
