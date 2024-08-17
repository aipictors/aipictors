import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { MutedTagList } from "~/routes/($lang).settings.muted.tags/components/muted-tag-list"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_MUTE_TAGS)
}

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
