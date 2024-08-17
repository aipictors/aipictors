import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { toDateText } from "~/utils/to-date-text"

type Props = {
  notification: FragmentOf<typeof WorkAwardNotificationFragment>
}

/**
 * ヘッダーのランキングのお知らせ内容
 */
export function HomeNotificationsContentAwardItem(props: Props) {
  if (props.notification.work === null) {
    return null
  }

  return (
    <Link
      to={`/posts/${props.notification.work.id}`}
      className="flex items-center p-1 transition-all"
    >
      <>
        <div className="h-12 w-12 overflow-hidden rounded-md">
          <img
            src={props.notification.work.smallThumbnailImageURL}
            alt="thumbnail"
            className="h-16 w-16 object-cover"
          />
        </div>
        <div className="ml-2 w-full overflow-hidden">
          <p className="text-ellipsis">{props.notification.message}</p>
          <p className="text-sm opacity-80">
            {toDateText(props.notification.createdAt)}
          </p>
        </div>
      </>
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
