import { SettingProfileForm } from "~/routes/($lang).settings.profile/components/setting-profile-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

/**
 * プロフィール設定ページ
 */
export default function SettingNotification() {
  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={"プロフィール"} />
      </div>
      <SettingProfileForm />
    </div>
  )
}
