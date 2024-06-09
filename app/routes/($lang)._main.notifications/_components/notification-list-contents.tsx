import { AppLoadingPage } from "@/_components/app/app-loading-page"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { NotificationListItems } from "@/routes/($lang)._main.notifications/_components/notification-list-items"
import { NotificationListSetting } from "@/routes/($lang)._main.notifications/_components/notification-list-settings"
import { Suspense, useState } from "react"

export const NotificationListContents = () => {
  const [notifyType, setNotifyType] =
    useState<IntrospectionEnum<"NotificationType"> | null>("LIKED_WORK")

  const [page, setPage] = useState(0)

  return (
    <>
      <NotificationListSetting
        notificationType={notifyType}
        setNotificationType={setNotifyType}
      />
      <Suspense fallback={<AppLoadingPage />}>
        <NotificationListItems type={notifyType} page={page} />
      </Suspense>
    </>
  )
}
