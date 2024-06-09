import { followNotificationFieldsFragment } from "@/_graphql/fragments/follow-notification-fields"
import { likedWorkNotificationFieldsFragment } from "@/_graphql/fragments/liked-work-notification-fields"
import { likedWorksSummaryNotificationFieldsFragment } from "@/_graphql/fragments/liked-works-summary-notification-fields"
import { workAwardNotificationFieldsFragment } from "@/_graphql/fragments/work-award-notification-fields"
import { workCommentNotificationFieldsFragment } from "@/_graphql/fragments/work-comment-notification-fields"
import { workCommentReplyNotificationFieldsFragment } from "@/_graphql/fragments/work-comment-reply-notification-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの通知
 */
export const viewerNotificationsQuery = graphql(
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
