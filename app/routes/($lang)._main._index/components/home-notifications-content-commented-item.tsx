import { Badge } from "~/components/ui/badge"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateEnText } from "~/utils/to-date-en-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  notification: FragmentOf<typeof WorkCommentNotificationFragment>
  stickerSize?: "xl" | "lg" | "md" | "sm" | "xs"
}

const stickerSizeClasses = {
  xl: "h-24 w-24 md:h-32 md:w-32",
  lg: "h-20 w-20 md:h-24 md:w-24",
  md: "h-12 w-12",
  sm: "h-8 w-8",
  xs: "h-6 w-6",
}

/**
 * ヘッダーのコメントのお知らせ内容
 */
export function HomeNotificationsContentCommentedItem(props: Props) {
  const t = useTranslation()

  const stickerClass = props.stickerSize
    ? stickerSizeClasses[props.stickerSize]
    : stickerSizeClasses.md

  const isReplied =
    props.notification.myReplies && props.notification.myReplies.length !== 0

  const [reply] = props.notification.myReplies ?? []

  return (
    <div className="flex flex-col space-y-2 border-b p-2">
      <Link
        to={`/posts/${props.notification.work?.id}`}
        className="flex items-center rounded-md p-2 transition-all hover:bg-zinc-100 hover:dark:bg-zinc-900"
      >
        <>
          <img
            src={withIconUrlFallback(props.notification.user?.iconUrl)}
            alt="thumbnail"
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="ml-2 w-full overflow-hidden">
            <p className="text-ellipsis">
              {t(
                `${props.notification.user?.name}さんがコメントしました`,
                `${props.notification.user?.name} commented`,
              )}
              {props.notification.message && (
                <>
                  {t("「", " '")}
                  {props.notification.message}
                  {t("」", " '")}
                </>
              )}
            </p>
            {props.notification.sticker?.imageUrl && (
              <img
                src={props.notification.sticker.imageUrl}
                alt="sticker"
                className={cn(stickerClass, "object-cover")}
              />
            )}
            <div className="flex items-center space-x-2">
              <p className="text-sm opacity-80">
                {t(
                  toDateTimeText(props.notification.createdAt),
                  toDateEnText(props.notification.createdAt),
                )}
              </p>
              {isReplied ? (
                <Badge variant="secondary">{t("返信済み", "Replied")}</Badge>
              ) : (
                <Badge variant="default">{t("未返信", "Not replied")}</Badge>
              )}
            </div>
          </div>
          <div className="h-12 w-12 overflow-hidden rounded-md">
            <img
              src={props.notification.work?.smallThumbnailImageURL}
              alt="thumbnail"
              className="h-16 w-16 object-cover"
            />
          </div>
        </>
      </Link>
      {reply && (
        <div className="ml-12 flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              className="h-8 w-8 rounded-full object-cover"
              src={withIconUrlFallback(reply.user?.iconUrl)}
              alt="thumbnail"
            />
            <AvatarFallback />
          </Avatar>
          <p className="text-ellipsis">
            {t(
              `${reply.user?.name}返信しました`,
              `${reply.user?.name} replied`,
            )}
            {reply.text && (
              <>
                {t("「", " '")}
                {reply.text}
                {t("」", " '")}
              </>
            )}
          </p>
          {reply.sticker?.imageUrl && (
            <img
              src={reply.sticker?.imageUrl}
              alt="sticker"
              className={cn(stickerClass, "object-cover")}
            />
          )}
        </div>
      )}
    </div>
  )
}

export const WorkCommentNotificationFragment = graphql(
  `fragment WorkCommentNotification on WorkCommentNotificationNode @_unmask {
    id
    createdAt
    message
    work {
      id
      smallThumbnailImageURL
    }
    user {
      id
      iconUrl
      name
    }
    sticker {
      id
      imageUrl
    }
    myReplies {
      id
      text
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
