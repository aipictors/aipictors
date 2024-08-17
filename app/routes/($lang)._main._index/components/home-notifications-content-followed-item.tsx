import { IconUrl } from "~/components/icon-url"
import { Link } from "@remix-run/react"
import { ArrowLeftRightIcon } from "lucide-react"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateText } from "~/utils/to-date-text"

type Props = {
  notification: FragmentOf<typeof FollowNotificationFragment>
}

/**
 * ヘッダーのコメントのお知らせ内容
 */
export const HomeNotificationsContentFollowedItem = (props: Props) => {
  if (props.notification.user === null) {
    return null
  }

  return (
    <Link
      className="flex items-center p-1 transition-all"
      to={`/users/${props.notification.user.id}`}
    >
      <img
        src={IconUrl(
          props.notification.user.iconUrl ??
            "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg",
        )}
        alt="thumbnail"
        className="h-8 w-8 rounded-full object-cover"
      />
      <div className="ml-2 w-full overflow-hidden">
        <p className="text-ellipsis">
          {props.notification.user.name}さんにフォローされました！
        </p>
        <p className="text-sm opacity-80">
          {toDateText(props.notification.createdAt)}
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
