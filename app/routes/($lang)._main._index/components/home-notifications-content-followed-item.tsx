import { Link } from "@remix-run/react"
import { ArrowLeftRightIcon } from "lucide-react"
import { graphql, type FragmentOf } from "gql.tada"
import { toDateEnText } from "~/utils/to-date-en-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { toDateTimeText } from "~/utils/to-date-time-text"

// ---------- 型 ----------

type FollowProps = {
  notification: FragmentOf<typeof FollowNotificationFragment>
  /**
   * クリックされたら呼ばれる。上位の DropdownMenu を閉じるときに使用
   */
  onClick?: () => void
}

/**
 * ヘッダーのフォロー通知内容
 */
export function HomeNotificationsContentFollowedItem({
  notification,
  onClick,
}: FollowProps) {
  const t = useTranslation()
  if (notification.user === null) return null

  return (
    <Link
      className="flex items-center p-1 transition-all"
      to={`/users/${notification.user.id}`}
      onClick={onClick}
    >
      <Avatar className="size-8">
        <AvatarImage
          className="size-8 rounded-full object-cover"
          src={withIconUrlFallback(notification.user.iconUrl)}
          alt="thumbnail"
        />
        <AvatarFallback />
      </Avatar>
      <div className="ml-2 w-full overflow-hidden">
        <p className="text-ellipsis">
          {t(
            `${notification.user.name}さんにフォローされました！`,
            `${notification.user.name} followed you!`,
          )}
        </p>
        <p className="text-sm opacity-80">
          {t(
            toDateTimeText(notification.createdAt),
            toDateEnText(notification.createdAt),
          )}
        </p>
      </div>
      {notification.user.isFollowee && (
        <ArrowLeftRightIcon className="size-6 text-zinc-500" />
      )}
    </Link>
  )
}

export const FollowNotificationFragment = graphql(
  `fragment FollowNotification on FollowNotificationNode @_unmask {
    id
    createdAt
    user {
      id
      name
      iconUrl
      isFollowee
    }
  }`,
)
