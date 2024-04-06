import { NotificationList } from "@/[lang]/(main)/notifications/_components/notification-list"
import { NotificationTab } from "@/[lang]/(main)/notifications/_components/notification-tab"
import { AppPage } from "@/_components/app/app-page"
import { Separator } from "@/_components/ui/separator"
import type { Metadata } from "next"

/**
 * 通知の一覧
 * @returns
 */
const NotificationsPage = async () => {
  return (
    <AppPage>
      <div>
        <NotificationTab />
        <Separator />
        <NotificationList />
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default NotificationsPage
