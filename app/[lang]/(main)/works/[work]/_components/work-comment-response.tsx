import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Avatar } from "@radix-ui/react-avatar"

type Props = {
  userIconImageURL?: string
  userName?: string
  text?: string
  stickerImageURL?: string
  createdAt: number
}

/**
 * 作品のコメントへの返信
 */
export const WorkCommentResponse = (props: Props) => {
  return (
    <div className="flex items-start space-x-2 pl-16">
      <Avatar>
        <AvatarImage
          className="w-12 rounded-full"
          src={props.userIconImageURL}
          alt=""
        />
        <AvatarFallback />
      </Avatar>
      <div className="space-y-0">
        <p>{props.userName}</p>
        <p className="overflow-hidden whitespace-pre-wrap break-words text-sm">
          {props.text}
        </p>
        {props.stickerImageURL && (
          <img className="w-20" alt="" src={props.stickerImageURL} />
        )}
        <div className="flex space-x-2">
          <p className="text-xs">{toDateTimeText(props.createdAt)}</p>
          <p className="text-xs">{"返信"}</p>
          <p className="text-xs">{"ダウンロード"}</p>
        </div>
      </div>
    </div>
  )
}
