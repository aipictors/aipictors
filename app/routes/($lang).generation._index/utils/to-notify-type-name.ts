import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"

export function toNotificationTypeName(
  type: IntrospectionEnum<"NotificationType"> | null,
) {
  const t = useTranslation()

  if (type === "LIKED_WORK") {
    return t("いいね", "Liked")
  }

  if (type === "LIKED_WORKS_SUMMARY") {
    return t("いいね集計", "Like Summary")
  }

  if (type === "WORK_COMMENT") {
    return t("コメント", "Comment")
  }

  if (type === "COMMENT_REPLY") {
    return t("返信", "Reply")
  }

  if (type === "FOLLOW") {
    return t("フォロー", "Follow")
  }

  if (type === "WORK_AWARD") {
    return t("ランキング", "Ranking")
  }

  return t("全て", "All")
}
