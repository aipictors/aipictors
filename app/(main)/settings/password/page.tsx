import type { Metadata } from "next"
import { MainSettingPassword } from "app/(main)/settings/password/components/MainSettingPassword"

const SettingPasswordPage = async () => {
  return <MainSettingPassword />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingPasswordPage
