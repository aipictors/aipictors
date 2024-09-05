import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { toNotificationTypeName } from "~/routes/($lang).generation._index/utils/to-notify-type-name"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  notificationType: IntrospectionEnum<"NotificationType"> | null
  setNotificationType: (
    type: IntrospectionEnum<"NotificationType"> | null,
  ) => void
}

/**
 * 通知履歴設定
 */
export function NotificationListSetting(props: Props) {
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
