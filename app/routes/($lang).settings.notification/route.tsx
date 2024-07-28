import { AppPageCenter } from "@/components/app/app-page-center"
import { SettingNotificationForm } from "@/routes/($lang).settings.notification/components/setting-notification-form"

/**
 * 通知設定ページ
 */
export default function SettingNotification() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"通知・いいね"}</p>
        <SettingNotificationForm />
      </div>
    </AppPageCenter>
  )
}
