import { AppPageCenter } from "@/components/app/app-page-center"
import { SettingProfileForm } from "@/routes/($lang).settings.profile/components/setting-profile-form"

/**
 * プロフィール設定ページ
 */
export default function SettingNotification() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"プロフィール"}</p>
        <SettingProfileForm />
      </div>
    </AppPageCenter>
  )
}
