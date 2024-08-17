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
export function HomeNotificationsContents(props: Props) {
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

  if (notifications.length === 0) {
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

  return (
    <ScrollArea className="h-96 overflow-y-auto">
      <div className="max-w-96 overflow-hidden">
        {notifications.map((notification) => {
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
          return null
        })}
      </div>
    </ScrollArea>
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
