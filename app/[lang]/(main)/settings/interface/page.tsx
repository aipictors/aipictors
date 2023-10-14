import { MainSettingInterface } from "app/[lang]/(main)/settings/interface/components/MainSettingInterface"
import type { Metadata } from "next"

const SettingInterfacePage = async () => {
  return <MainSettingInterface />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingInterfacePage
