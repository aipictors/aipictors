import { AppPage } from "@/_components/app/app-page"
import { Separator } from "@/_components/ui/separator"
import { NotificationList } from "@/routes/($lang)._main.notifications/_components/notification-list"
import { NotificationTab } from "@/routes/($lang)._main.notifications/_components/notification-tab"

/**
 * 通知の一覧
 * @returns
 */
export default function Notifications() {
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
