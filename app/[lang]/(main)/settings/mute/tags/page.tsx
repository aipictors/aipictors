import { MainSettingMuteTags } from "app/[lang]/(main)/settings/mute/tags/components/MainSettingMuteTags"
import type { Metadata } from "next"

const SettingMuteTagsPage = async () => {
  return <MainSettingMuteTags />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingMuteTagsPage
