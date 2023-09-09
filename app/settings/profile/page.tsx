import { Metadata } from "next"
import { MainSettingProfile } from "app/settings/profile/components/MainSettingProfile"

const SettingProfilePage = async () => {
  return <MainSettingProfile />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingProfilePage
