import { NotificationListContents } from "~/routes/($lang)._main.notifications/components/notification-list-contents"
import { useTranslation } from "~/hooks/use-translation"

export function NotificationList() {
  const t = useTranslation()

  return (
    <div className="w-full">
      <div>
        <p className="font-bold text-xl">
          {t("通知履歴", "Notification history")}
        </p>
        <NotificationListContents />
      </div>
    </div>
  )
}
