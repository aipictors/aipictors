import { MainSettingPassword } from "app/[lang]/(main)/settings/password/components/MainSettingPassword"
import type { Metadata } from "next"

const SettingPasswordPage = async () => {
  return <MainSettingPassword />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingPasswordPage
