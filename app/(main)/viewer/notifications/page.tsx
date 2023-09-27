import type { Metadata } from "next"
import { NotificationItemList } from "app/(main)/viewer/notifications/components/NotificationItemList"
import { MainPage } from "app/components/MainPage"

const ViewerNotificationsPage = async () => {
  return (
    <MainPage>
      <NotificationItemList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerNotificationsPage
