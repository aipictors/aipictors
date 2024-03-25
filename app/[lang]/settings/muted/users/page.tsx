import { MutedUserList } from "@/app/[lang]/settings/muted/users/_components/muted-user-list"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const SettingMutedUsersPage = async () => {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"ミュートしているユーザ"}</p>
        <MutedUserList />
      </div>
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default SettingMutedUsersPage
