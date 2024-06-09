import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/_components/ui/select"
import { useState } from "react"
import { toNotificationTypeName } from "@/routes/($lang).generation._index/_utils/to-notify-type-name"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  notificationType: IntrospectionEnum<"NotificationType"> | null
  setNotificationType: (
    type: IntrospectionEnum<"NotificationType"> | null,
  ) => void
}

/**
 * 通知履歴設定
 */
export const NotificationListSetting = (props: Props) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [maxHeight, setMaxHeight] = useState("0px")

  const [opacity, setOpacity] = useState(0)

  const onToggleFilterButton = () => {
    if (isFilterOpen) {
      setMaxHeight("0px")
      setOpacity(0)
    } else {
      setMaxHeight("480px") // 適切な高さに調整
      setOpacity(1)
    }
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <>
      <div className="mt-4 mb-4">
        <div className="flex space-x-4">
          <Select
            value={props.notificationType ? props.notificationType : ""}
            onValueChange={(value) => {
              if (value === "ALL") {
                props.setNotificationType(null)
                return
              }
              props.setNotificationType(
                value as IntrospectionEnum<"NotificationType">,
              )
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  props.notificationType
                    ? toNotificationTypeName(props.notificationType)
                    : "すべての通知"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LIKED_WORK">{"いいね"}</SelectItem>
              {/* <SelectItem value="LIKED_WORKS_SUMMARY">
                {"いいね集計"}
              </SelectItem> */}
              <SelectItem value="WORK_COMMENT">{"コメント"}</SelectItem>
              <SelectItem value="COMMENT_REPLY">{"返信"}</SelectItem>
              <SelectItem value="FOLLOW">{"フォロー"}</SelectItem>
              <SelectItem value="WORK_AWARD">{"ランキング"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}
