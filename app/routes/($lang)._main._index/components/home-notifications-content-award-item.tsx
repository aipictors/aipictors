import { Link } from "@remix-run/react"

type Props = {
  workId: string
  thumbnailUrl: string
  message: string
  createdAt: string
}

/**
 * ヘッダーのランキングのお知らせ内容
 */
export function HomeNotificationsContentAwardItem(props: Props) {
  return (
    <>
      <Link
        to={`/posts/${props.workId}`}
        className="flex items-center p-1 transition-all"
      >
        <>
          <div className="h-12 w-12 overflow-hidden rounded-md">
            <img
              src={props.thumbnailUrl}
              alt="thumbnail"
              className="h-16 w-16 object-cover"
            />
          </div>
          <div className="ml-2 w-full overflow-hidden">
            <p className="text-ellipsis">{props.message}</p>
            <p className="text-sm opacity-80">{props.createdAt}</p>
          </div>
        </>
      </Link>
    </>
  )
}
