import { MutedTagList } from "@/app/[lang]/settings/muted/tags/_components/muted-tag-list"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const SettingMutedTagsPage = async () => {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">ミュートしているタグ</p>
        <MutedTagList />
      </div>
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default SettingMutedTagsPage
