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
  onClick?: () => void
}

/**
 * ヘッダーのお知らせメニューのコメントタブ
 */
export function HomeNotificationCommentsContents(props: Props) {
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

  return (
    <div className="max-w-96 overflow-hidden">
      {notifications.map((notification) => {
        if (
          props.type === "WORK_COMMENT" &&
          notification.__typename === "WorkCommentNotificationNode"
        ) {
          return (
            <HomeNotificationsContentCommentedItem
              key={notification.id}
              notification={notification}
              onClick={props.onClick}
            />
          )
        }
        if (
          props.type === "COMMENT_REPLY" &&
          notification.__typename === "WorkCommentReplyNotificationNode"
        ) {
          return (
            <HomeNotificationsContentReplyItem
              key={notification.id}
              notification={notification}
              onClick={props.onClick}
            />
          )
        }
        return null
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
