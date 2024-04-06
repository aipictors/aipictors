import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { toDateTimeText } from "@/_utils/to-date-time-text"

type Props = {
  userIconImageURL?: string
  userName?: string
  text?: string
  stickerImageURL?: string
  createdAt: number
}

/**
 * 作品へのコメント
 */
export const WorkComment = (props: Props) => {
  return (
    <div className="flex items-start space-x-2">
      <Avatar>
        <AvatarImage
          className="w-12 rounded-full"
          src={props.userIconImageURL}
          alt=""
        />
        <AvatarFallback />
      </Avatar>
      <div>
        <span>{props.userName}</span>
        {props.text && (
          <p className="overflow-hidden whitespace-pre-wrap break-words text-sm">
            {props.text}
          </p>
        )}
        {props.stickerImageURL && (
          <img className="w-20" alt="" src={props.stickerImageURL} />
        )}
        <div className="flex space-x-2">
          <span className="text-xs">{toDateTimeText(props.createdAt)}</span>
          <span className="text-xs">{"返信"}</span>
          <span className="text-xs">{"ダウンロード"}</span>
        </div>
      </div>
    </div>
  )
}
