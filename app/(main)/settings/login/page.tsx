import type { Metadata } from "next"
import { MainSettingLogin } from "app/(main)/settings/login/components/MainSettingLogin"

const SettingLoginPage = async () => {
  return <MainSettingLogin />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingLoginPage
