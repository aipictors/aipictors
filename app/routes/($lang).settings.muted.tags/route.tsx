import { MutedTagList } from "~/routes/($lang).settings.muted.tags/components/muted-tag-list"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

export default function SettingMutedTags() {
  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={"ミュートしているタグ"} />
      </div>
      <MutedTagList />
    </div>
  )
}
