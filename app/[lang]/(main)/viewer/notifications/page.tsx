import { NotificationArticle } from "app/[lang]/(main)/viewer/notifications/components/NotificationArticle"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

const ViewerNotificationsPage = async () => {
  return (
    <MainPage>
      <NotificationArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerNotificationsPage
