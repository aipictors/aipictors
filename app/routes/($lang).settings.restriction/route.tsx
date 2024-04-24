import { AppPageCenter } from "@/_components/app/app-page-center"
import { SettingRestrictionForm } from "@/routes/($lang).settings.restriction/_components/setting-restriction-form"

export default function SettingRestriction() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"表示するコンテンツ"}</p>
        <SettingRestrictionForm />
      </div>
    </AppPageCenter>
  )
}
