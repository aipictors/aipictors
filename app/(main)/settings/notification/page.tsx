import { Metadata } from "next"
import { MainSettingNotification } from "app/(main)/settings/notification/components/MainSettingNotification"

const SettingNotificationPage = async () => {
  return <MainSettingNotification />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingNotificationPage
