import { followNotificationFieldsFragment } from "~/graphql/fragments/follow-notification-fields"
import { likedWorkNotificationFieldsFragment } from "~/graphql/fragments/liked-work-notification-fields"
import { likedWorksSummaryNotificationFieldsFragment } from "~/graphql/fragments/liked-works-summary-notification-fields"
import { workAwardNotificationFieldsFragment } from "~/graphql/fragments/work-award-notification-fields"
import { workCommentNotificationFieldsFragment } from "~/graphql/fragments/work-comment-notification-fields"
import { workCommentReplyNotificationFieldsFragment } from "~/graphql/fragments/work-comment-reply-notification-fields"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toDateText } from "~/utils/to-date-text"
import { HomeNotificationsContentCommentedItem } from "~/routes/($lang)._main._index/components/home-notifications-content-commented-item"
import { HomeNotificationsContentReplyItem } from "~/routes/($lang)._main._index/components/home-notifications-content-reply-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

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
    <div className="max-w-96 overflow-hidden">
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
              repliedItem={null}
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
            />
          )
        })}
    </div>
  )
}

const viewerNotificationsQuery = graphql(
  `query ViewerNotifications($offset: Int!, $limit: Int!, $where: NotificationsWhereInput) {
    viewer {
      id
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
