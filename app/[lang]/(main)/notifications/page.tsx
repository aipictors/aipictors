import { NotificationList } from "@/app/[lang]/(main)/notifications/_components/notification-list"
import { NotificationTab } from "@/app/[lang]/(main)/notifications/_components/notification-tab"
import { MainPage } from "@/app/_components/page/main-page"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next"

/**
 * 通知の一覧
 * @returns
 */
const NotificationsPage = async () => {
  return (
    <MainPage>
      <div>
        <NotificationTab />
        <Separator />
        <NotificationList />
      </div>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NotificationsPage
