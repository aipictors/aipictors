import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateText } from "~/lib/app/utils/to-date-text"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  notification: FragmentOf<typeof WorkCommentReplyNotificationFragment>
  stickerSize?: "lg" | "md" | "sm" | "xs"
}

const stickerSizeClasses = {
  lg: "h-20 w-20 md:h-24 md:w-24",
  md: "h-12 w-12",
  sm: "h-8 w-8",
  xs: "h-6 w-6",
}

/**
 * ヘッダーの返信のお知らせ内容
 */
export function HomeNotificationsContentReplyItem(props: Props) {
  const stickerClass = props.stickerSize
    ? stickerSizeClasses[props.stickerSize]
    : stickerSizeClasses.md

  return (
    <>
      <Link
        to={`/posts/${props.notification.work?.id}`}
        className="flex items-center border-b transition-all hover:bg-zinc-100 hover:dark:bg-zinc-900"
      >
        <Link to={`/users/${props.notification.user?.id}`}>
          <img
            src={withIconUrlFallback(props.notification.user?.iconUrl)}
            alt="thumbnail"
            className="h-8 w-8 rounded-full object-cover"
          />
        </Link>
        <div className="ml-2 w-full overflow-hidden">
          <p className="text-ellipsis">
            {props.notification.user?.name}さんが返信しました
            {props.notification.message && `「${props.notification.message}」`}
          </p>
          {props.notification.sticker?.imageUrl && (
            <img
              src={props.notification.sticker.imageUrl}
              alt="sticker"
              className={cn(stickerClass, "h-12 w-12")}
            />
          )}
          <p className="text-sm opacity-80">
            {toDateText(props.notification.createdAt)}
          </p>
        </div>
        <div className="h-12 w-12 overflow-hidden rounded-md">
          <img
            src={props.notification.work?.smallThumbnailImageURL}
            alt="thumbnail"
            className="h-16 w-16 object-cover"
          />
        </div>
      </Link>
    </>
  )
}

export const WorkCommentReplyNotificationFragment = graphql(
  `fragment WorkCommentReplyNotification on WorkCommentReplyNotificationNode @_unmask {
    id
    createdAt
    message
    work {
      id
      smallThumbnailImageURL
    }
    user {
      id
      name
      iconUrl
    }
    sticker {
      id
      imageUrl
    }
  }`,
)
