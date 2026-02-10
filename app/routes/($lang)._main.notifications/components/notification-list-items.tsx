import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import {
  HomeNotificationsContentAwardItem,
  WorkAwardNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-award-item"
import { WorkCommentNotificationFragment } from "~/routes/($lang)._main._index/components/home-notifications-content-commented-item"
import {
  FollowNotificationFragment,
  HomeNotificationsContentFollowedItem,
} from "~/routes/($lang)._main._index/components/home-notifications-content-followed-item"
import {
  HomeNotificationsContentLikedItem,
  LikedWorkNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-liked-item"
import { WorkCommentReplyNotificationFragment } from "~/routes/($lang)._main._index/components/home-notifications-content-reply-item"
import {
  HomeNotificationsContentSumLikedItem,
  LikedWorksSummaryNotificationFragment,
} from "~/routes/($lang)._main._index/components/home-notifications-content-sum-liked-item"
import { NotificationListItemDetail } from "~/routes/($lang)._main.notifications/components/notification-list-item-detail"
import { NotificationListReplyItemDetail } from "~/routes/($lang)._main.notifications/components/notification-list-reply-item-detail"

type Props = {
  type: IntrospectionEnum<"NotificationType">
  page: number
}

export function NotificationListItems(props: Props) {
  const result = useSuspenseQuery(ViewerNotificationsQuery, {
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        type: props.type,
      },
      orderBy: "CREATED_AT",
    },
    fetchPolicy: "cache-first",
  })

  const [filter, setFilter] = useState<"all" | "replied" | "notReplied">("all")

  const notifications = result.data?.viewer?.notifications ?? []

  const t = useTranslation()

  const filteredNotifications =
    props.type === "WORK_COMMENT"
      ? notifications.filter((notification) => {
          return (
            notification.__typename === "WorkCommentNotificationNode" &&
            (filter === "all" ||
              (filter === "replied" &&
                notification.myReplies &&
                notification.myReplies.length > 0) ||
              (filter === "notReplied" &&
                notification.myReplies &&
                notification.myReplies.length === 0))
          )
        })
      : notifications

  console.log(filteredNotifications)

  return (
    <div className="flex flex-col space-y-4 overflow-hidden">
      {props.type === "WORK_COMMENT" && (
        <div className="flex space-x-2">
          <Button
            variant={"secondary"}
            onClick={() => setFilter("all")}
            className={cn(filter === "all" && "opacity-80")}
          >
            {t("全て", "All")}
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => setFilter("replied")}
            className={cn(filter === "replied" && "opacity-80")}
          >
            {t("返信済み", "Replied")}
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => setFilter("notReplied")}
            className={cn(filter === "notReplied" && "opacity-80")}
          >
            {t("未返信", "Not replied")}
          </Button>
        </div>
      )}
      {filteredNotifications.map((notification) => {
        if (
          props.type === "WORK_COMMENT" &&
          notification.__typename === "WorkCommentNotificationNode"
        ) {
          return (
            <NotificationListItemDetail
              key={notification.id}
              notification={notification}
              stickerSize="xl"
            />
          )
        }
        if (
          props.type === "COMMENT_REPLY" &&
          notification.__typename === "WorkCommentReplyNotificationNode"
        ) {
          return (
            <NotificationListReplyItemDetail
              key={notification.id}
              notification={notification}
              stickerSize="xl"
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
