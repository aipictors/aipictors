import { MainSettingNotification } from "app/[lang]/(main)/settings/notification/components/MainSettingNotification"
import type { Metadata } from "next"

const SettingNotificationPage = async () => {
  return <MainSettingNotification />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingNotificationPage
