import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { MutedUserList } from "~/routes/($lang).settings.muted.users/components/muted-user-list"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_MUTE_USERS)
}

export default function SettingMutedUsers() {
  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={"ミュートしているユーザ"} />
      </div>
      <MutedUserList />
    </div>
  )
}
