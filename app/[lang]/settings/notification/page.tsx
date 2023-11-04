import { SettingNotificationForm } from "app/[lang]/settings/notification/_components/SettingNotificationForm"
import { MainCenterPage } from "app/_components/pages/MainCenterPage"
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
