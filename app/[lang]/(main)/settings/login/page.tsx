import { MainSettingLogin } from "app/[lang]/(main)/settings/login/components/MainSettingLogin"
import type { Metadata } from "next"

const SettingLoginPage = async () => {
  return <MainSettingLogin />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingLoginPage
