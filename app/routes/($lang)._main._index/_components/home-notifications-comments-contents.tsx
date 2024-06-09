import { viewerNotificationsQuery } from "@/_graphql/queries/viewer/viewer-notifications"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { toDateText } from "@/_utils/to-date-text"
import { HomeNotificationsContentCommentedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-commented-item"
import { HomeNotificationsContentReplyItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-reply-item"
import { useSuspenseQuery } from "@apollo/client/index"

type Props = {
  type: IntrospectionEnum<"NotificationType">
}

/**
 * ヘッダーのお知らせメニューのコメントタブ
 */
export const HomeNotificationCommentsContents = (props: Props) => {
  const { data: notifications } = useSuspenseQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 40,
      where: {
        type: props.type,
      },
    },
    fetchPolicy: "cache-first",
  })

  const notificationList = notifications?.viewer?.notifications

  return (
    <div className="max-w-96 space-y-2 overflow-hidden p-2">
      {props.type === "WORK_COMMENT" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          // Add type assertion for notificationList
          return (
            <HomeNotificationsContentCommentedItem
              key={notification.id}
              workId={notification.work?.id ?? ""}
              thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
              iconUrl={notification.user?.iconImage?.downloadURL ?? ""}
              stickerUrl={notification.sticker?.imageUrl ?? ""}
              comment={notification.message ?? ""}
              userName={notification.user?.name ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
            />
          )
        })}
      {props.type === "COMMENT_REPLY" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          // Add type assertion for notificationList
          return (
            <HomeNotificationsContentReplyItem
              key={notification.id}
              ownerUserId={notification.user?.id ?? ""}
              workId={notification.work?.id ?? ""}
              thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
              iconUrl={notification.user?.iconImage?.downloadURL ?? ""}
              stickerUrl={notification.sticker?.imageUrl ?? ""}
              comment={notification.message ?? ""}
              userName={notification.user?.name ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
            />
          )
        })}
    </div>
  )
}
