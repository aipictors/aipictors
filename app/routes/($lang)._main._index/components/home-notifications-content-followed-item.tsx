import { IconUrl } from "~/components/icon-url"
import { Link } from "@remix-run/react"
import { ArrowLeftRightIcon } from "lucide-react"

type Props = {
  isFollow: boolean
  userId: string
  iconUrl: string
  userName: string
  createdAt: string
}

/**
 * ヘッダーのコメントのお知らせ内容
 */
export function HomeNotificationsContentFollowedItem(props: Props) {
  return (
    <>
      <Link
        className="flex items-center p-1 transition-all"
        to={`/users/${props.userId}`}
      >
        <img
          src={IconUrl(props.iconUrl)}
          alt="thumbnail"
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="ml-2 w-full overflow-hidden">
          <p className="text-ellipsis">
            {props.userName}さんにフォローされました！
          </p>
          <p className="text-sm opacity-80">{props.createdAt}</p>
        </div>
        {props.isFollow && (
          <>
            <ArrowLeftRightIcon className="h-6 w-6 text-zinc-500" />
          </>
        )}
      </Link>
    </>
  )
}
