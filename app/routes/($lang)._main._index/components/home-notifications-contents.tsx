import { useSuspenseQuery } from "@apollo/client/index"
import {
  HomeNotificationsContentLikedItem,
  LikedWorkNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-liked-item"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  HomeNotificationsContentAwardItem,
  WorkAwardNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-award-item"
import {
  FollowNotificationFragment,
  HomeNotificationsContentFollowedItem,
} from "~/routes/($lang)._main._index/components/home-notifications-content-followed-item"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { graphql } from "gql.tada"

type Props = {
  type: IntrospectionEnum<"NotificationType">
}

/**
 * ヘッダーのお知らせ内容
 */
export const HomeNotificationsContents = (props: Props) => {
  const query = useSuspenseQuery(ViewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 40,
      where: {
        type: props.type,
      },
    },
    fetchPolicy: "cache-first",
  })

  const notifications = query.data.viewer?.notifications ?? []

  if (notifications?.length === 0) {
    return (
      <>
        <div className="m-auto">
          <img
            alt="sorry-image"
            className="m-auto w-48 md:w-64"
            src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/pictor-chan-sorry-image.png"
          />
          <p className="text-center text-xl opacity-60">{"通知はありません"}</p>
        </div>
      </>
    )
  }

  const activeNotifications = notifications.filter((notification) => {
    if (props.type === "LIKED_WORK") {
      return notification.__typename === "LikedWorkNotificationNode"
    }
    if (props.type === "WORK_AWARD") {
      return notification.__typename === "WorkAwardNotificationNode"
    }
    if (props.type === "FOLLOW") {
      return notification.__typename === "FollowNotificationNode"
    }
    return false
  })

  return (
    <>
      <ScrollArea className="h-96 overflow-y-auto">
        <div className="max-w-96 overflow-hidden">
          {activeNotifications.map((notification) => {
            if (props.type !== "LIKED_WORK") return null
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
        </div>
      </ScrollArea>
    </>
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
        ... on WorkAwardNotificationNode {
          ...WorkAwardNotification
        }
        ... on FollowNotificationNode {
          ...FollowNotification
        }
      }
    }
  }`,
  [
    LikedWorkNotificationFragment,
    WorkAwardNotificationFragment,
    FollowNotificationFragment,
  ],
)
