import type { NotificationType } from "@/_graphql/__generated__/graphql"
import { NotificationListContents } from "@/routes/($lang)._main.notifications/_components/notification-list-contents"
import { useState } from "react"

export const NotificationList = () => {
  const [page, setPage] = useState(0)

  const tabValues: NotificationType[] = [
    "LIKED_WORK",
    "WORK_COMMENT",
    "COMMENT_REPLY",
    "WORK_AWARD",
    "FOLLOW",
  ]

  // const tabLabel = ["いいね", "コメント", "返信", "ランキング", "フォロー"]

  return (
    <div className="w-full">
      <div>
        <p className="font-bold text-xl">通知履歴</p>
        <NotificationListContents />
      </div>
    </div>
  )
}
