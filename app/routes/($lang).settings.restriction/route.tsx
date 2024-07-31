import { SettingRestrictionForm } from "~/routes/($lang).settings.restriction/components/setting-restriction-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

export default function SettingRestriction() {
  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={"表示するコンテンツ"} />
      </div>
      <SettingRestrictionForm />
    </div>
  )
}
