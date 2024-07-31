import { MutedUserList } from "~/routes/($lang).settings.muted.users/components/muted-user-list"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

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
