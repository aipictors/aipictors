import { NotificationList } from "@/[lang]/(main)/notifications/_components/notification-list"
import { NotificationTab } from "@/[lang]/(main)/notifications/_components/notification-tab"
import { AppPage } from "@/_components/app/app-page"
import { Separator } from "@/_components/ui/separator"

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
