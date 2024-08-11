import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  HomeNotificationsContentCommentedItem,
  WorkCommentNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-commented-item"
import {
  HomeNotificationsContentReplyItem,
  WorkCommentReplyNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-reply-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  type: IntrospectionEnum<"NotificationType">
}

/**
 * ヘッダーのお知らせメニューのコメントタブ
 */
export const HomeNotificationCommentsContents = (props: Props) => {
  const result = useSuspenseQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 40,
      where: {
        type: props.type,
      },
    },
    fetchPolicy: "cache-first",
  })

  const notifications = result.data?.viewer?.notifications ?? []

  const activeNotifications = notifications.filter((notification) => {
    if (props.type === "WORK_COMMENT") {
      return notification.__typename === "WorkCommentNotificationNode"
    }
    if (props.type === "COMMENT_REPLY") {
      return notification.__typename === "WorkCommentReplyNotificationNode"
    }
    return false
  })

  return (
    <div className="max-w-96 overflow-hidden">
      {activeNotifications.map((notification) => {
        if (notification.__typename !== "WorkCommentNotificationNode") {
          return null
        }
        return (
          <HomeNotificationsContentCommentedItem
            key={notification.id}
            notification={notification}
          />
        )
      })}
      {activeNotifications.map((notification) => {
        if (notification.__typename !== "WorkCommentReplyNotificationNode") {
          return null
        }
        return (
          <HomeNotificationsContentReplyItem
            key={notification.id}
            notification={notification}
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
        ... on WorkCommentNotificationNode {
          ...WorkCommentNotification
        }
        ... on WorkCommentReplyNotificationNode {
          ...WorkCommentReplyNotification
        }
      }
    }
  }`,
  [WorkCommentNotificationFragment, WorkCommentReplyNotificationFragment],
)
