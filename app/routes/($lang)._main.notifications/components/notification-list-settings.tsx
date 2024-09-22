import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "~/components/ui/button"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"

type Props = {
  notificationType: IntrospectionEnum<"NotificationType"> | null
  setNotificationType: (
    type: IntrospectionEnum<"NotificationType"> | null,
  ) => void
}

const notificationTypes = [
  { value: "LIKED_WORK", label: "いいね" },
  { value: "WORK_COMMENT", label: "コメント" },
  { value: "COMMENT_REPLY", label: "返信" },
  { value: "FOLLOW", label: "フォロー" },
  { value: "WORK_AWARD", label: "ランキング" },
]

export function NotificationListSetting(props: Props) {
  const location = useLocation()
  const navigate = useNavigate()

  // URLからパラメータを取得して初期化
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const type = params.get(
      "type",
    ) as IntrospectionEnum<"NotificationType"> | null
    if (type) {
      props.setNotificationType(type)
    }
  }, [location.search])

  // ページ切り替えハンドラー
  const handlePageChange = (
    type: IntrospectionEnum<"NotificationType"> | null,
  ) => {
    const params = new URLSearchParams(location.search)
    if (type) {
      params.set("type", type)
    } else {
      params.delete("type")
    }
    navigate({ search: params.toString() })
    props.setNotificationType(type)
  }

  return (
    <>
      <div className="mt-4 mb-4">
        <div className="flex space-x-4">
          {notificationTypes.map((item) => (
            <Button
              key={item.value}
              variant="secondary"
              onClick={() =>
                handlePageChange(
                  item.value as IntrospectionEnum<"NotificationType">,
                )
              }
              className={cn(
                "transition-opacity duration-300",
                props.notificationType === item.value
                  ? "opacity-50"
                  : "opacity-100",
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  )
}
