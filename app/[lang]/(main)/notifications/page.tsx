import { NotificationArticle } from "app/[lang]/(main)/notifications/_components/NotificationArticle"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

const NotificationsPage = async () => {
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

export default NotificationsPage
