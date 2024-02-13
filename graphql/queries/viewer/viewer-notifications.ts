import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザの通知
 */
export const viewerNotificationsQuery = gql(`
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
`)
