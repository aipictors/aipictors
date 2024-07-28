import type { IntrospectionEnum } from "@/lib/introspection-enum"

export const toNotificationTypeName = (
  type: IntrospectionEnum<"NotificationType"> | null,
) => {
  if (type === "LIKED_WORK") {
    return "いいね"
  }

  if (type === "LIKED_WORKS_SUMMARY") {
    return "いいね集計"
  }

  if (type === "WORK_COMMENT") {
    return "コメント"
  }

  if (type === "COMMENT_REPLY") {
    return "返信"
  }

  if (type === "FOLLOW") {
    return "フォロー"
  }

  if (type === "WORK_AWARD") {
    return "ランキング"
  }

  return "全て"
}
