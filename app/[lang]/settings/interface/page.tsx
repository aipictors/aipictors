import { SettingInterfaceForm } from "@/app/[lang]/settings/interface/_components/setting-interface-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const SettingInterfacePage = async () => {
  return (
    <MainCenterPage>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"UIカスタム"}</p>
        <SettingInterfaceForm />
      </div>
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingInterfacePage
