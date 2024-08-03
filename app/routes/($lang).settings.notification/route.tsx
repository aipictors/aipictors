import { SettingNotificationForm } from "~/routes/($lang).settings.notification/components/setting-notification-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

/**
 * 通知設定ページ
 */
export default function SettingNotification() {
  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={"通知・いいね"} />
      </div>
      <SettingNotificationForm />
    </div>
  )
}
