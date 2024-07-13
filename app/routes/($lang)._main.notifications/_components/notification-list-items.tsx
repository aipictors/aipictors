import { followNotificationFieldsFragment } from "@/_graphql/fragments/follow-notification-fields"
import { likedWorkNotificationFieldsFragment } from "@/_graphql/fragments/liked-work-notification-fields"
import { likedWorksSummaryNotificationFieldsFragment } from "@/_graphql/fragments/liked-works-summary-notification-fields"
import { workAwardNotificationFieldsFragment } from "@/_graphql/fragments/work-award-notification-fields"
import { workCommentNotificationFieldsFragment } from "@/_graphql/fragments/work-comment-notification-fields"
import { workCommentReplyNotificationFieldsFragment } from "@/_graphql/fragments/work-comment-reply-notification-fields"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { toDateText } from "@/_utils/to-date-text"
import { HomeNotificationsContentAwardItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-award-item"
import { HomeNotificationsContentCommentedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-commented-item"
import { HomeNotificationsContentFollowedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-followed-item"
import { HomeNotificationsContentLikedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-liked-item"
import { HomeNotificationsContentReplyItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-reply-item"
import { HomeNotificationsContentSumLikedItem } from "@/routes/($lang)._main._index/_components/home-notifications-content-sum-liked-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  type: IntrospectionEnum<"NotificationType"> | null
  page: number
}

export const NotificationListItems = (props: Props) => {
  const { data: notifications } = useSuspenseQuery(viewerNotificationsQuery, {
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        type: props.type !== null ? props.type : undefined,
      },
      orderBy: "CREATED_AT",
    },
    fetchPolicy: "cache-first",
  })

  const notificationList = notifications?.viewer?.notifications

  return (
    <div className="space-y-2 overflow-hidden p-2">
      {props.type === "WORK_COMMENT" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          // Add type assertion for notificationList
          return (
            <HomeNotificationsContentCommentedItem
              key={notification.id}
              workId={notification.work?.id ?? ""}
              thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
              iconUrl={notification.user?.iconUrl ?? ""}
              stickerUrl={notification.sticker?.imageUrl ?? ""}
              comment={notification.message ?? ""}
              userName={notification.user?.name ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
              isReplied={notification.myReplies.length !== 0}
              repliedItem={
                notification.myReplies[0]
                  ? {
                      id: notification.myReplies[0].id,
                      comment: notification.myReplies[0].message,
                      user: {
                        id: notification.myReplies[0].user.id,
                        name: notification.myReplies[0].user.name,
                        iconUrl: notification.myReplies[0].user.iconUrl,
                      },
                      stickerUrl:
                        notification.myReplies[0].sticker?.imageUrl ?? "",
                    }
                  : null
              }
              stickerSize="lg"
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
              iconUrl={notification.user?.iconUrl ?? ""}
              stickerUrl={notification.sticker?.imageUrl ?? ""}
              comment={notification.message ?? ""}
              userName={notification.user?.name ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
              stickerSize="lg"
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
              iconUrl={notification.user?.iconUrl ?? ""}
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
              iconUrl={notification.user?.iconUrl ?? ""}
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

const viewerNotificationsQuery = graphql(
  `query ViewerNotifications($offset: Int!, $limit: Int!, $where: NotificationsWhereInput) {
    viewer {
      notifications(offset: $offset, limit: $limit, where: $where) {
        ... on LikedWorkNotificationNode {
          ...LikedWorkNotificationFields
        }
        ... on LikedWorksSummaryNotificationNode {
          ...LikedWorksSummaryNotificationFields
        }
        ... on WorkAwardNotificationNode {
          ...WorkAwardNotificationFields
        }
        ... on WorkCommentNotificationNode {
          ...WorkCommentNotificationFields
        }
        ... on WorkCommentReplyNotificationNode {
          ...WorkCommentReplyNotificationFields
        }
        ... on FollowNotificationNode {
          ...FollowNotificationFields
        }
      }
    }
  }`,
  [
    likedWorkNotificationFieldsFragment,
    likedWorksSummaryNotificationFieldsFragment,
    workAwardNotificationFieldsFragment,
    workCommentNotificationFieldsFragment,
    workCommentReplyNotificationFieldsFragment,
    followNotificationFieldsFragment,
  ],
)
