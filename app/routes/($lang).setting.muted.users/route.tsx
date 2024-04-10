import { MutedUserList } from "@/[lang]/settings/muted/users/_components/muted-user-list"
import { AppPageCenter } from "@/_components/app/app-page-center"

export default function SettingMutedUsers() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"ミュートしているユーザ"}</p>
        <MutedUserList />
      </div>
    </AppPageCenter>
  )
}
