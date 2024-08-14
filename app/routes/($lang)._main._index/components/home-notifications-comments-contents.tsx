import { workCommentNotificationFieldsFragment } from "~/graphql/fragments/work-comment-notification-fields"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toDateText } from "~/utils/to-date-text"
import { HomeNotificationsContentCommentedItem } from "~/routes/($lang)._main._index/components/home-notifications-content-commented-item"
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
export function HomeNotificationCommentsContents(props: Props) {
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

  return (
    <div className="max-w-96 overflow-hidden">
      {props.type === "WORK_COMMENT" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
          return (
            <HomeNotificationsContentCommentedItem
              key={notification.id}
              workId={notification.work?.id ?? ""}
              thumbnailUrl={notification.work?.smallThumbnailImageURL ?? ""}
              iconUrl={notification.user?.iconUrl ?? ""}
              stickerUrl={notification.sticker?.imageUrl ?? ""}
              comment={notification.message ?? ""}
              userName={notification.user?.name ?? ""}
              createdAt={toDateText(notification.createdAt) ?? ""}
              isReplied={notification.myReplies.length !== 0}
              repliedItem={null}
            />
          )
        })}
      {props.type === "COMMENT_REPLY" &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (notificationList as any[])?.map((notification) => {
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
          ...WorkCommentNotificationFields
        }
        ... on WorkCommentReplyNotificationNode {
          ...WorkCommentReplyNotification
        }
      }
    }
  }`,
  [workCommentNotificationFieldsFragment, WorkCommentReplyNotificationFragment],
)
