import {} from "~/components/ui/dropdown-menu"
import {} from "~/components/ui/tabs"
import { useSuspenseQuery } from "@apollo/client/index"
import { HomeNotificationsContentLikedItem } from "~/routes/($lang)._main._index/components/home-notifications-content-liked-item"
import { toDateText } from "~/utils/to-date-text"
import { ScrollArea } from "~/components/ui/scroll-area"
import { HomeNotificationsContentAwardItem } from "~/routes/($lang)._main._index/components/home-notifications-content-award-item"
import { HomeNotificationsContentFollowedItem } from "~/routes/($lang)._main._index/components/home-notifications-content-followed-item"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { followNotificationFieldsFragment } from "~/graphql/fragments/follow-notification-fields"
import { likedWorkNotificationFieldsFragment } from "~/graphql/fragments/liked-work-notification-fields"
import { likedWorksSummaryNotificationFieldsFragment } from "~/graphql/fragments/liked-works-summary-notification-fields"
import { workAwardNotificationFieldsFragment } from "~/graphql/fragments/work-award-notification-fields"
import { workCommentNotificationFieldsFragment } from "~/graphql/fragments/work-comment-notification-fields"
import { workCommentReplyNotificationFieldsFragment } from "~/graphql/fragments/work-comment-reply-notification-fields"
import { graphql } from "gql.tada"

type Props = {
  type: IntrospectionEnum<"NotificationType">
}

/**
 * ヘッダーのお知らせ内容
 */
export const HomeNotificationsContents = (props: Props) => {
  const { data: notifications } = useSuspenseQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 40,
      where: {
        type: props.type,
      },
    },
    fetchPolicy: "cache-first",
  })

  const notificationList = notifications?.viewer?.notifications

  if (notificationList?.length === 0) {
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
    <>
      <ScrollArea className="h-96 overflow-y-auto">
        <div className="max-w-96 overflow-hidden">
          {props.type === "LIKED_WORK" &&
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (notificationList as any[])?.map((notification) => {
              // Add type assertion for notificationList
              return (
                <HomeNotificationsContentLikedItem
                  key={notification.id}
                  workId={notification.work?.id ?? ""}
                  thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
                  iconUrl={
                    notification.user?.iconUrl ??
                    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg"
                  }
                  title={notification.work?.title ?? ""}
                  userName={notification.user?.name ?? ""}
                  createdAt={toDateText(notification.createdAt) ?? ""}
                />
              )
            })}
          {props.type === "WORK_AWARD" &&
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (notificationList as any[])?.map((notification) => {
              // Add type assertion for notificationList
              return (
                <HomeNotificationsContentAwardItem
                  key={notification.id}
                  workId={notification.work?.id ?? ""}
                  thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
                  message={notification.message ?? ""}
                  createdAt={toDateText(notification.createdAt) ?? ""}
                />
              )
            })}
          {props.type === "FOLLOW" &&
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (notificationList as any[])?.map((notification) => {
              // Add type assertion for notificationList
              return (
                <HomeNotificationsContentFollowedItem
                  key={notification.id}
                  isFollow={notification.user?.isFollowee ?? false}
                  userId={notification.user?.id ?? ""}
                  iconUrl={
                    notification.user?.iconUrl ??
                    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg"
                  }
                  userName={notification.user?.name ?? ""}
                  createdAt={toDateText(notification.createdAt) ?? ""}
                />
              )
            })}
        </div>
      </ScrollArea>
    </>
  )
}

const viewerNotificationsQuery = graphql(
  `query ViewerNotifications($offset: Int!, $limit: Int!, $where: NotificationsWhereInput) {
    viewer {
      id
      notifications(offset: $offset, limit: $limit, where: $where) {
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
  }`,
  [
    likedWorkNotificationFieldsFragment,
    likedWorksSummaryNotificationFieldsFragment,
    workAwardNotificationFieldsFragment,
    workCommentNotificationFieldsFragment,
    workCommentReplyNotificationFieldsFragment,
    followNotificationFieldsFragment,
  ],
)
