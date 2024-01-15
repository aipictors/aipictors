import { followNotificationFieldsFragment } from "@/graphql/fragments/follow-notification-fields"
import { likedWorkNotificationFieldsFragment } from "@/graphql/fragments/liked-work-notification-fields"
import { likedWorksSummaryNotificationFieldsFragment } from "@/graphql/fragments/liked-works-summary-notification-fields"
import { workAwardNotificationFieldsFragment } from "@/graphql/fragments/work-award-notification-fields"
import { workCommentNotificationFieldsFragment } from "@/graphql/fragments/work-comment-notification-fields"
import { workCommentReplyNotificationFieldsFragment } from "@/graphql/fragments/work-comment-reply-notification-fields"
import { gql } from "@apollo/client"

export const viewerNotificationsQuery = gql`
  ${likedWorkNotificationFieldsFragment}
  ${likedWorksSummaryNotificationFieldsFragment}
  ${workAwardNotificationFieldsFragment}
  ${workCommentNotificationFieldsFragment}
  ${workCommentReplyNotificationFieldsFragment}
  ${followNotificationFieldsFragment}
  query ViewerNotifications($offset: Int!, $limit: Int!) {
    viewer {
      notifications(offset: $offset, limit: $limit) {
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
  }
`
