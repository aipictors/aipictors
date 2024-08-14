import { Link } from "@remix-run/react"

type Props = {
  workId: string
  thumbnailUrl: string
  iconUrl: string
  title: string
  userName: string
  createdAt: string
}

/**
 * ヘッダーのいいねのお知らせ内容
 */
export function HomeNotificationsContentLikedItem(props: Props) {
  return (
    <>
      {props.workId && (
        <Link
          to={`/posts/${props.workId}`}
          className="flex items-center p-1 transition-all hover:opacity-80"
        >
          <>
            <div className="h-12 w-12 overflow-hidden rounded-md">
              {props.thumbnailUrl ? (
                <img
                  src={props.thumbnailUrl}
                  alt="thumbnail"
                  className="h-16 w-16 object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-md" />
              )}
            </div>
            <div className="ml-2 w-full overflow-hidden">
              <p className="text-ellipsis">
                {props.userName && <span>{`${props.userName}さんから`}</span>}
                いいねされました！
              </p>
              <p className="text-sm opacity-80">{props.createdAt}</p>
            </div>
          </>
        </Link>
      )}
    </>
  )
}
