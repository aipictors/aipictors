import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  HomeNotificationsContentAwardItem,
  WorkAwardNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-award-item"
import {
  HomeNotificationsContentCommentedItem,
  WorkCommentNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-commented-item"
import {
  FollowNotificationFragment,
  HomeNotificationsContentFollowedItem,
} from "~/routes/($lang)._main._index/components/home-notifications-content-followed-item"
import {
  HomeNotificationsContentLikedItem,
  LikedWorkNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-liked-item"
import {
  HomeNotificationsContentReplyItem,
  WorkCommentReplyNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-reply-item"
import {
  HomeNotificationsContentSumLikedItem,
  LikedWorksSummaryNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-sum-liked-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  type: IntrospectionEnum<"NotificationType"> | null
  page: number
}

export function NotificationListItems(props: Props) {
  const result = useSuspenseQuery(ViewerNotificationsQuery, {
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

  const notifications = result.data?.viewer?.notifications ?? []

  return (
    <div className="space-y-2 overflow-hidden p-2">
      {notifications.map((notification) => {
        if (
          props.type === "WORK_COMMENT" &&
          notification.__typename === "WorkCommentNotificationNode"
        ) {
          return (
            <HomeNotificationsContentCommentedItem
              key={notification.id}
              notification={notification}
              stickerSize="lg"
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
              stickerSize="lg"
            />
          )
        }
        if (
          props.type === "LIKED_WORK" &&
          notification.__typename === "LikedWorkNotificationNode"
        ) {
          return (
            <HomeNotificationsContentLikedItem
              key={notification.id}
              notification={notification}
            />
          )
        }
        if (
          props.type === "WORK_AWARD" &&
          notification.__typename === "WorkAwardNotificationNode"
        ) {
          return (
            <HomeNotificationsContentAwardItem
              key={notification.id}
              notification={notification}
            />
          )
        }
        if (
          props.type === "FOLLOW" &&
          notification.__typename === "FollowNotificationNode"
        ) {
          return (
            <HomeNotificationsContentFollowedItem
              key={notification.id}
              notification={notification}
            />
          )
        }
        if (
          props.type === "LIKED_WORKS_SUMMARY" &&
          notification.__typename === "LikedWorksSummaryNotificationNode"
        ) {
          return (
            <HomeNotificationsContentSumLikedItem
              key={notification.id}
              notification={notification}
            />
          )
        }
        return null
      })}
    </div>
  )
}

const ViewerNotificationsQuery = graphql(
  `query ViewerNotifications($offset: Int!, $limit: Int!, $where: NotificationsWhereInput) {
    viewer {
      id
      notifications(offset: $offset, limit: $limit, where: $where) {
        ... on LikedWorkNotificationNode {
          ...LikedWorkNotification
        }
        ... on LikedWorksSummaryNotificationNode {
          ...LikedWorksSummaryNotification
        }
        ... on WorkAwardNotificationNode {
          ...WorkAwardNotification
        }
        ... on WorkCommentNotificationNode {
          ...WorkCommentNotification
        }
        ... on WorkCommentReplyNotificationNode {
          ...WorkCommentReplyNotification
        }
        ... on FollowNotificationNode {
          ...FollowNotification
        }
      }
    }
  }`,
  [
    FollowNotificationFragment,
    LikedWorkNotificationFragment,
    LikedWorksSummaryNotificationFragment,
    WorkAwardNotificationFragment,
    WorkCommentNotificationFragment,
    WorkCommentReplyNotificationFragment,
  ],
)
