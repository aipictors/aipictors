import { MainSettingProfile } from "app/[lang]/(main)/settings/profile/components/MainSettingProfile"
import type { Metadata } from "next"

const SettingProfilePage = async () => {
  return <MainSettingProfile />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingProfilePage
