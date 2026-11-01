import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { ArrowLeftRightIcon } from "lucide-react"
import { FollowButton } from "~/components/button/follow-button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { toDateEnText } from "~/utils/to-date-en-text"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

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
    <div className="flex items-center gap-2 p-1 transition-all">
      <Link
        className="flex min-w-0 flex-1 items-center"
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
      </Link>
      {/* フォローし返していない人には、その場でフォローバックできるボタンを出す */}
      {notification.user.isFollowee ? (
        <ArrowLeftRightIcon
          className="size-6 shrink-0 text-zinc-500"
          aria-label={t("相互フォロー", "Mutual follow")}
        />
      ) : (
        <div className="w-28 shrink-0">
          <FollowButton
            targetUserId={notification.user.id}
            targetUserName={notification.user.name}
            isFollow={false}
            isFollower={true}
            className="h-7 text-xs"
          />
        </div>
      )}
    </div>
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
