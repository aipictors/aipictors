import { IconUrl } from "@/components/icon-url"
import {} from "@/components/ui/dropdown-menu"
import {} from "@/components/ui/tabs"
import { Link } from "@remix-run/react"

type Props = {
  ownerUserId: string
  workId: string
  thumbnailUrl: string
  iconUrl: string
  stickerUrl: string
  comment: string
  userName: string
  createdAt: string
  stickerSize?: "lg" | "md" | "sm" | "xs"
}

const stickerSizeClasses = {
  lg: "h-20 w-20 md:h-24 md:w-24",
  md: "h-12 w-12",
  sm: "h-8 w-8",
  xs: "h-6 w-6",
}

/**
 * ヘッダーの返信のお知らせ内容
 */
export const HomeNotificationsContentReplyItem = (props: Props) => {
  const stickerClass = props.stickerSize
    ? stickerSizeClasses[props.stickerSize]
    : stickerSizeClasses.md

  return (
    <>
      <Link
        to={`/posts/${props.workId}`}
        className="flex items-center border-b transition-all hover:bg-zinc-100 hover:dark:bg-zinc-900"
      >
        <Link to={`/users/${props.ownerUserId}`}>
          <img
            src={IconUrl(props.iconUrl)}
            alt="thumbnail"
            className="h-8 w-8 rounded-full object-cover"
          />
        </Link>
        <div className="ml-2 w-full overflow-hidden">
          <p className="text-ellipsis">
            {props.userName}さんが返信しました
            {props.comment && (
              <>
                {"「"}
                {props.comment}
                {"」"}
              </>
            )}
          </p>
          {props.stickerUrl && (
            <img
              src={props.stickerUrl}
              alt="sticker"
              className={`${stickerClass} h-12 w-12`}
            />
          )}
          <p className="text-sm opacity-80">{props.createdAt}</p>
        </div>
        <div className="h-12 w-12 overflow-hidden rounded-md">
          <img
            src={props.thumbnailUrl}
            alt="thumbnail"
            className="h-16 w-16 object-cover"
          />
        </div>
      </Link>
    </>
  )
}
