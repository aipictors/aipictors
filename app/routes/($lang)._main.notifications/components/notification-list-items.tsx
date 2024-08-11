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

export const NotificationListItems = (props: Props) => {
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

  const activeNotifications = notifications.filter((notification) => {
    if (props.type === "LIKED_WORK") {
      return notification.__typename === "LikedWorkNotificationNode"
    }
    if (props.type === "WORK_AWARD") {
      return notification.__typename === "WorkAwardNotificationNode"
    }
    if (props.type === "WORK_COMMENT") {
      return notification.__typename === "WorkCommentNotificationNode"
    }
    if (props.type === "COMMENT_REPLY") {
      return notification.__typename === "WorkCommentReplyNotificationNode"
    }
    if (props.type === "FOLLOW") {
      return notification.__typename === "FollowNotificationNode"
    }
    if (props.type === "LIKED_WORKS_SUMMARY") {
      return notification.__typename === "LikedWorksSummaryNotificationNode"
    }
    return false
  })

  return (
    <div className="space-y-2 overflow-hidden p-2">
      {activeNotifications.map((notification) => {
        if (notification.__typename !== "WorkCommentNotificationNode") {
          return null
        }
        return (
          <HomeNotificationsContentCommentedItem
            key={notification.id}
            notification={notification}
            stickerSize="lg"
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
            stickerSize="lg"
          />
        )
      })}
      {activeNotifications.map((notification) => {
        if (notification.__typename !== "LikedWorkNotificationNode") {
          return null
        }
        return (
          <HomeNotificationsContentLikedItem
            key={notification.id}
            notification={notification}
          />
        )
      })}
      {activeNotifications.map((notification) => {
        if (notification.__typename !== "WorkAwardNotificationNode") {
          return null
        }
        return (
          <HomeNotificationsContentAwardItem
            key={notification.id}
            notification={notification}
          />
        )
      })}
      {activeNotifications.map((notification) => {
        if (notification.__typename !== "FollowNotificationNode") {
          return null
        }
        return (
          <HomeNotificationsContentFollowedItem
            key={notification.id}
            notification={notification}
          />
        )
      })}
      {activeNotifications.map((notification) => {
        if (notification.__typename !== "LikedWorksSummaryNotificationNode") {
          return null
        }
        return (
          <HomeNotificationsContentSumLikedItem
            key={notification.id}
            notification={notification}
          />
        )
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
