import { SettingInterfaceForm } from "@/app/[lang]/settings/interface/_components/setting-interface-form"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const SettingInterfacePage = async () => {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"UIカスタム"}</p>
        <SettingInterfaceForm />
      </div>
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingInterfacePage
