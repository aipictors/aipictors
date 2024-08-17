import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { SettingProfileForm } from "~/routes/($lang).settings.profile/components/setting-profile-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_PROFILE)
}

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
