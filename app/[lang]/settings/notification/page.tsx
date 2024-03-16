import { SettingFcmForm } from "@/app/[lang]/settings/notification/_components/setting-fcm-form"
import { SettingNotificationForm } from "@/app/[lang]/settings/notification/_components/setting-notification-form"
import { AppPageCenter } from "@/components/app/app-page-center"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next"

const SettingNotificationPage = async () => {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"通知・いいね"}</p>
        <SettingNotificationForm />
        <Separator />
        <SettingFcmForm />
      </div>
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingNotificationPage
