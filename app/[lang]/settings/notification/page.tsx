import { SettingNotificationForm } from "@/app/[lang]/settings/notification/_components/setting-notification-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const SettingNotificationPage = async () => {
  return (
    <MainCenterPage>
      <SettingNotificationForm />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingNotificationPage
