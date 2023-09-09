import { Metadata } from "next"
import { MainSettingInterface } from "app/settings/interface/components/MainSettingInterface"

const SettingInterfacePage = async () => {
  return <MainSettingInterface />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingInterfacePage
