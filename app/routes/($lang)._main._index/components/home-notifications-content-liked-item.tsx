import { Link } from "react-router"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { toDateText } from "~/utils/to-date-text"
import { toDateEnText } from "~/utils/to-date-en-text"

type Props = {
  notification: FragmentOf<typeof LikedWorkNotificationFragment>
}

/**
 * ヘッダーのいいねのお知らせ内容
 */
export function HomeNotificationsContentLikedItem(props: Props) {
  const t = useTranslation()

  if (props.notification.work === null) {
    return null
  }

  return (
    <Link
      to={`/posts/${props.notification.work.id}`}
      className="flex items-center p-1 transition-all hover:opacity-80"
    >
      <>
        <div className="h-12 w-12 overflow-hidden rounded-md">
          {props.notification.work.smallThumbnailImageURL ? (
            <img
              src={props.notification.work.smallThumbnailImageURL}
              alt="thumbnail"
              className="h-16 w-16 object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-md" />
          )}
        </div>
        <div className="ml-2 w-full overflow-hidden">
          <p className="text-ellipsis">
            {props.notification.user?.name && (
              <span>
                {t(
                  `${props.notification.user.name}さんから`,
                  `${props.notification.user.name}  `,
                )}
              </span>
            )}
            {t("いいねされました！", "Liked")}
          </p>
          <p className="text-sm opacity-80">
            {t(
              toDateText(props.notification.createdAt),
              toDateEnText(props.notification.createdAt),
            )}
          </p>
        </div>
      </>
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
