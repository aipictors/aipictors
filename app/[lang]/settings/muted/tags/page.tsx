import { MutedTagList } from "@/app/[lang]/settings/muted/tags/_components/muted-tag-list"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const SettingMutedTagsPage = async () => {
  return (
    <MainCenterPage>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">ミュートしているタグ</p>
        <MutedTagList />
      </div>
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingMutedTagsPage
