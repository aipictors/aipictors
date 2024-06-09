import { viewerNotificationsQuery } from "@/_graphql/queries/viewer/viewer-notifications"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { toDateText } from "@/_utils/to-date-text"
import { HomeNotificationsContentAwardItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-award-item"
import { HomeNotificationsContentCommentedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-commented-item"
import { HomeNotificationsContentFollowedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-followed-item"
import { HomeNotificationsContentLikedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-liked-item"
import { HomeNotificationsContentReplyItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-reply-item"
import { HomeNotificationsContentSumLikedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-sum-liked-item"
import { useSuspenseQuery } from "@apollo/client/index"

type Props = {
  type: IntrospectionEnum<"NotificationType"> | null
  page: number
}

export const NotificationListItems = (props: Props) => {
  const { data: notifications } = useSuspenseQuery(viewerNotificationsQuery, {
    variables: {
      offset: props.page * 160,
      limit: 160,
      where: {
        type: props.type !== null ? props.type : undefined,
      },
      orderBy: "CREATED_AT",
    },
    fetchPolicy: "cache-first",
  })

  const notificationList = notifications?.viewer?.notifications

  console.log(notificationList)

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
      {props.type === "LIKED_WORK" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          // Add type assertion for notificationList
          return (
            <HomeNotificationsContentLikedItem
              key={notification.id}
              workId={notification.work?.id ?? ""}
              thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
              iconUrl={notification.user?.iconImage?.downloadURL ?? ""}
              userName={notification.user?.name ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
              title={notification.work?.title ?? ""}
            />
          )
        })}
      {props.type === "WORK_AWARD" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          // Add type assertion for notificationList
          return (
            <HomeNotificationsContentAwardItem
              key={notification.id}
              workId={notification.work?.id ?? ""}
              thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
              message={notification.message ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
            />
          )
        })}

      {props.type === "FOLLOW" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          return (
            <HomeNotificationsContentFollowedItem
              key={notification.id}
              isFollow={notification.user?.isFollowee ?? false}
              userId={notification.user?.id ?? ""}
              iconUrl={notification.user?.iconImage?.downloadURL ?? ""}
              userName={notification.user?.name ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
            />
          )
        })}

      {props.type === "LIKED_WORKS_SUMMARY" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          return (
            <HomeNotificationsContentSumLikedItem
              key={notification.id}
              message={notification.message ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
            />
          )
        })}
    </div>
  )
}
