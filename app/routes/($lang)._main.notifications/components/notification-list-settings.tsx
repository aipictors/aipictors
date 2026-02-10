import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  notificationType: IntrospectionEnum<"NotificationType">
  setNotificationType: (type: IntrospectionEnum<"NotificationType">) => void
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

  const defaultType = notificationTypes[0]
    .value as IntrospectionEnum<"NotificationType">

  // URLからパラメータを取得して初期化
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const typeParam = params.get("type")
    const matched = notificationTypes.find((t) => t.value === typeParam)
    props.setNotificationType(
      (matched?.value ?? defaultType) as IntrospectionEnum<"NotificationType">,
    )
  }, [location.search])

  // ページ切り替えハンドラー
  const handlePageChange = (type: IntrospectionEnum<"NotificationType">) => {
    const params = new URLSearchParams(location.search)
    params.set("type", type)
    navigate({ search: params.toString() })
    props.setNotificationType(type)
  }

  return (
    <>
      <div className="-mx-4 sticky top-24 z-20 bg-background/95 px-4 py-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <AppAnimatedTabs
          tabs={notificationTypes.map((t) => ({
            label: t.label,
            value: t.value,
          }))}
          value={props.notificationType}
          onChange={(value) =>
            handlePageChange(value as IntrospectionEnum<"NotificationType">)
          }
        />
      </div>
    </>
  )
}
