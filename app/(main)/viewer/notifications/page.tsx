import type { Metadata } from "next"
import { NotificationList } from "app/(main)/viewer/notifications/components/NotificationList"
import { NotificationTab } from "app/(main)/viewer/notifications/components/NotificationTab"
import { MainPage } from "app/components/MainPage"

const ViewerNotificationsPage = async () => {
  return (
    <MainPage>
      <NotificationTab />
      <NotificationList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerNotificationsPage
