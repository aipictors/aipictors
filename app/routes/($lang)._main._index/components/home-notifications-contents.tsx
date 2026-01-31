import { useSuspenseQuery } from "@apollo/client/index"
import {
  HomeNotificationsContentLikedItem,
  LikedWorkNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-liked-item"
import {
  HomeNotificationsContentAwardItem,
  WorkAwardNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-award-item"
import {
  HomeNotificationsContentFollowedItem,
  FollowNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-followed-item"
import { ScrollArea } from "~/components/ui/scroll-area"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  type: IntrospectionEnum<"NotificationType">
  /**
   * リストアイテムがクリックされたら呼ばれる。上位で DropdownMenu を閉じたいときに使う
   */
  onItemSelect?: () => void
}

export function HomeNotificationsContents ({ type, onItemSelect }: Props) {
  const { data } = useSuspenseQuery(ViewerNotificationsQuery, {
    variables: { offset: 0, limit: 40, where: { type } },
    fetchPolicy: "cache-first",
  })

  const notifications = data.viewer?.notifications ?? []
  const t = useTranslation()

  // デバッグ用ログ
  console.log("📋 HomeNotificationsContents render:", {
    type,
    notificationsCount: notifications.length,
    hasViewer: !!data.viewer,
    notifications: notifications.map((n) => ({
      typename: n.__typename,
      hasId: "id" in n,
      hasCreatedAt: "createdAt" in n,
    })),
  })

  if (notifications.length === 0) {
    return (
      <div className="m-auto text-center">
        <img
          alt="sorry-image"
          className="m-auto w-48 md:w-64"
          src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/pictor-chan-sorry-image.png"
        />
        <p className="text-xl opacity-60">
          {t("通知はありません", "There are no notifications")}
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-64 overflow-y-auto md:h-96">
      <div className="max-w-96 overflow-hidden">
        {notifications.map((n) => {
          if (
            type === "LIKED_WORK" &&
            n.__typename === "LikedWorkNotificationNode"
          ) {
            return (
              <HomeNotificationsContentLikedItem
                key={n.id}
                notification={n}
                onClick={onItemSelect}
              />
            )
          }
          if (
            type === "WORK_AWARD" &&
            n.__typename === "WorkAwardNotificationNode"
          ) {
            return (
              <HomeNotificationsContentAwardItem
                key={n.id}
                notification={n}
                onClick={onItemSelect}
              />
            )
          }
          if (type === "FOLLOW" && n.__typename === "FollowNotificationNode") {
            return (
              <HomeNotificationsContentFollowedItem
                key={n.id}
                notification={n}
                onClick={onItemSelect}
              />
            )
          }
          // WORK_COMMENT は別タブで描画するためここには来ない
          return null
        })}
      </div>
    </ScrollArea>
  )
}

// ---------- GraphQL ----------
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
