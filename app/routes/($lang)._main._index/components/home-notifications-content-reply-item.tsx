import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { toDateText } from "~/lib/app/utils/to-date-text"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  notification: FragmentOf<typeof WorkCommentReplyNotificationFragment>
  stickerSize?: "xl" | "lg" | "md" | "sm" | "xs"
  onClick?: () => void
}

const stickerSizeClasses = {
  xl: "size-24 md:h-32 md:w-32",
  lg: "size-20 md:h-24 md:w-24",
  md: "size-12",
  sm: "size-8",
  xs: "size-6",
}

/**
 * ヘッダーの返信のお知らせ内容
 */
export function HomeNotificationsContentReplyItem (props: Props) {
  const stickerClass = props.stickerSize
    ? stickerSizeClasses[props.stickerSize]
    : stickerSizeClasses.md

  return (
    <>
      <Link
        to={`/posts/${props.notification.work?.id}`}
        className="flex items-center border-b transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
        onClick={props.onClick}
      >
        <Link to={`/users/${props.notification.user?.id}`}>
          <Avatar className="size-8">
            <AvatarImage
              className="size-8 rounded-full object-cover"
              src={withIconUrlFallback(props.notification.user?.iconUrl)}
              alt="thumbnail"
            />
            <AvatarFallback />
          </Avatar>
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
              className={cn(stickerClass, "size-12")}
            />
          )}
          <p className="text-sm opacity-80">
            {toDateText(props.notification.createdAt)}
          </p>
        </div>
        <div className="size-12 overflow-hidden rounded-md">
          <img
            src={props.notification.work?.smallThumbnailImageURL}
            alt="thumbnail"
            className="size-16 object-cover"
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
    comment {
      id
      createdAt
      text
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
    }
  }`,
)
