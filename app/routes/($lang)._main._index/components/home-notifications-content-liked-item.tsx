import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { toDateEnText } from "~/utils/to-date-en-text"
import { toDateTimeText } from "~/utils/to-date-time-text"

type LikedProps = {
  notification: FragmentOf<typeof LikedWorkNotificationFragment>
  /**
   * クリックされたら呼ばれる。上位 DropdownMenu を閉じるのに使用
   */
  onClick?: () => void
}

/**
 * ヘッダーのいいねのお知らせ内容
 */
export function HomeNotificationsContentLikedItem({
  notification,
  onClick,
}: LikedProps) {
  const t = useTranslation()
  if (notification.work === null) return null

  return (
    <Link
      to={`/posts/${notification.work.id}`}
      className="flex items-center p-1 transition-all hover:opacity-80"
      onClick={onClick}
    >
      <div className="size-12 overflow-hidden rounded-md">
        {notification.work.smallThumbnailImageURL ? (
          <img
            src={notification.work.smallThumbnailImageURL}
            alt="thumbnail"
            className="size-16 object-cover"
          />
        ) : (
          <div className="size-16 rounded-md" />
        )}
      </div>
      <div className="ml-2 w-full overflow-hidden">
        <p className="text-ellipsis">
          {notification.user?.name && (
            <span>
              {t(
                `${notification.user.name}さんから`,
                `${notification.user.name} `,
              )}
            </span>
          )}
          {t("いいねされました！", "Liked")}
        </p>
        <p className="text-sm opacity-80">
          {t(
            toDateTimeText(notification.createdAt),
            toDateEnText(notification.createdAt),
          )}
        </p>
      </div>
    </Link>
  )
}

export const LikedWorkNotificationFragment = graphql(
  `fragment LikedWorkNotification on LikedWorkNotificationNode @_unmask {
    id
    createdAt
    work {
      id
      title
      smallThumbnailImageURL
    }
    user {
      id
      name
      iconUrl
    }
  }`,
)
