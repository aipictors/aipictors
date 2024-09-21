import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { toNotificationTypeName } from "~/routes/($lang).generation._index/utils/to-notify-type-name"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"

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
  const t = useTranslation()

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
                    : t("すべての通知", "All notifications")
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LIKED_WORK">{t("いいね", "Likes")}</SelectItem>
              <SelectItem value="WORK_COMMENT">
                {t("コメント", "Comments")}
              </SelectItem>
              <SelectItem value="COMMENT_REPLY">
                {t("返信", "Replies")}
              </SelectItem>
              <SelectItem value="FOLLOW">{t("フォロー", "Follows")}</SelectItem>
              <SelectItem value="WORK_AWARD">
                {t("ランキング", "Ranking")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}
