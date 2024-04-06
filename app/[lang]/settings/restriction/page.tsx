import { SettingRestrictionForm } from "@/[lang]/settings/restriction/_components/account-restriction-form"
import { AppPageCenter } from "@/_components/app/app-page-center"
import type { Metadata } from "next"

const SettingRestrictionPage = async () => {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"非表示対象"}</p>
        <SettingRestrictionForm />
      </div>
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default SettingRestrictionPage
