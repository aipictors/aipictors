import { Metadata } from "next"
import { MainSettingAccount } from "app/(main)/settings/account/components/MainSettingAccount"

const SettingAccountPage = async () => {
  return <MainSettingAccount />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingAccountPage
