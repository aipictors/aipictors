import { Link } from "react-router"
import { ArrowLeftRightIcon } from "lucide-react"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateText } from "~/utils/to-date-text"
import { toDateEnText } from "~/utils/to-date-en-text"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  notification: FragmentOf<typeof FollowNotificationFragment>
}

/**
 * ヘッダーのフォロー通知内容
 */
export function HomeNotificationsContentFollowedItem(props: Props) {
  const t = useTranslation()

  if (props.notification.user === null) {
    return null
  }

  return (
    <Link
      className="flex items-center p-1 transition-all"
      to={`/users/${props.notification.user.id}`}
    >
      <img
        src={ExchangeIconUrl(
          props.notification.user.iconUrl ??
            "https://assets.aipictors.com/no-profile.webp",
        )}
        alt="thumbnail"
        className="h-8 w-8 rounded-full object-cover"
      />
      <div className="ml-2 w-full overflow-hidden">
        <p className="text-ellipsis">
          {t(
            `${props.notification.user.name}さんにフォローされました！`,
            `${props.notification.user.name} followed you!`,
          )}
        </p>
        <p className="text-sm opacity-80">
          {t(
            toDateText(props.notification.createdAt),
            toDateEnText(props.notification.createdAt),
          )}
        </p>
      </div>
      {props.notification.user.isFollowee && (
        <ArrowLeftRightIcon className="h-6 w-6 text-zinc-500" />
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
