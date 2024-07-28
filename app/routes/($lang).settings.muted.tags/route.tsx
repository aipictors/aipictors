import { AppPageCenter } from "~/components/app/app-page-center"
import { MutedTagList } from "~/routes/($lang).settings.muted.tags/components/muted-tag-list"

export default function SettingMutedTags() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">ミュートしているタグ</p>
        <MutedTagList />
      </div>
    </AppPageCenter>
  )
}
