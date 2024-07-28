import { AppPageCenter } from "@/components/app/app-page-center"
import { MutedUserList } from "@/routes/($lang).settings.muted.users/components/muted-user-list"

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
