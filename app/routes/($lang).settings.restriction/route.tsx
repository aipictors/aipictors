import { SettingRestrictionForm } from "~/routes/($lang).settings.restriction/components/setting-restriction-form"

export default function SettingRestriction() {
  return (
    <div className="w-full space-y-8">
      <p className="font-bold text-2xl">{"表示するコンテンツ"}</p>
      <SettingRestrictionForm />
    </div>
  )
}
