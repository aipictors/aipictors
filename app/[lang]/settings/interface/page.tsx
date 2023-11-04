import { SettingInterfaceForm } from "app/[lang]/settings/interface/_components/SettingInterfaceForm"
import { MainCenterPage } from "app/_components/pages/MainCenterPage"
import type { Metadata } from "next"

const SettingInterfacePage = async () => {
  return (
    <MainCenterPage>
      <SettingInterfaceForm />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingInterfacePage
