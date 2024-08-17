import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { SettingNotificationForm } from "~/routes/($lang).settings.notification/components/setting-notification-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_NOTIFICATION)
}

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
