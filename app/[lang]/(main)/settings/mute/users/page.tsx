import type { Metadata } from "next"
import { MainSettingMuteUsers } from "app/[lang]/(main)/settings/mute/users/components/MainSettingMuteUsers"

const SettingMuteUsersPage = async () => {
  return <MainSettingMuteUsers />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingMuteUsersPage
