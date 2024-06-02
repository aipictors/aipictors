import {} from "@/_components/ui/dropdown-menu"
import {} from "@/_components/ui/tabs"
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
export const HomeNotificationsContentFollowedItem = (props: Props) => {
  return (
    <>
      <a
        className="flex items-center p-1 transition-all hover:bg-zinc-100 hover:dark:bg-zinc-900"
        href={`/users/${props.userId}`}
      >
        <img
          src={props.iconUrl}
          alt="thumbnail"
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="ml-2 w-full max-w-64 overflow-hidden">
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
      </a>
    </>
  )
}
