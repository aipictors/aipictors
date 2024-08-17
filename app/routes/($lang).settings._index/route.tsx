import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { SettingsNavigation } from "~/routes/($lang).settings._index/components/settings-navigation"
import { SettingNotificationForm } from "~/routes/($lang).settings.notification/components/setting-notification-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_ACCOUNT)
}

/**
 * 設定
 */
export default function Settings() {
  return (
    <div className="w-full space-y-4">
      <div className="hidden space-y-4 md:block">
        <div className="block md:hidden">
          <SettingsHeader title={"通知・いいね"} />
        </div>
        <SettingNotificationForm />
      </div>
      <div className="block md:hidden">
        <SettingsNavigation />
      </div>
    </div>
  )
}
