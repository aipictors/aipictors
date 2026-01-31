import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { toDateText } from "~/utils/to-date-text"

// ---------- 型 ----------

type Props = {
  notification: FragmentOf<typeof WorkAwardNotificationFragment>
  /**
   * クリックされたら呼ばれる。上位の DropdownMenu を閉じるときに使用
   */
  onClick?: () => void
}

/**
 * ヘッダーのランキングのお知らせ内容
 */
export function HomeNotificationsContentAwardItem ({
  notification,
  onClick,
}: Props) {
  if (notification.work === null) return null

  return (
    <Link
      to={`/posts/${notification.work.id}`}
      className="flex items-center p-1 transition-all"
      onClick={onClick}
    >
      <div className="size-12 overflow-hidden rounded-md">
        <img
          src={notification.work.smallThumbnailImageURL}
          alt="thumbnail"
          className="size-16 object-cover"
        />
      </div>
      <div className="ml-2 w-full overflow-hidden">
        <p className="text-ellipsis">{notification.message}</p>
        <p className="text-sm opacity-80">
          {toDateText(notification.createdAt)}
        </p>
      </div>
    </Link>
  )
}

export const WorkAwardNotificationFragment = graphql(
  `fragment WorkAwardNotification on WorkAwardNotificationNode @_unmask {
    id
    createdAt
    message
    work {
      id
      title
      smallThumbnailImageURL
    }
  }`,
)
