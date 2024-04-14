import { SettingRestrictionForm } from "@/[lang]/settings/restriction/_components/account-restriction-form"
import { AppPageCenter } from "@/_components/app/app-page-center"

export default function SettingRestriction() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"非表示対象"}</p>
        <SettingRestrictionForm />
      </div>
    </AppPageCenter>
  )
}
