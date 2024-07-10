import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの通知数
 */
export const viewerNotificationsCountQuery = graphql(
  `query ViewerNotifications($where: NotificationsWhereInput) {
    viewer {
      notificationsCount(where: $where)
    }
  }`,
)
