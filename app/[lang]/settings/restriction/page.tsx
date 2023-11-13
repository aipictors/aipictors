import { SettingRestrictionForm } from "@/app/[lang]/settings/restriction/_components/account-restriction-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const SettingRestrictionPage = async () => {
  return (
    <MainCenterPage>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"非表示対象"}</p>
        <SettingRestrictionForm />
      </div>
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingRestrictionPage
