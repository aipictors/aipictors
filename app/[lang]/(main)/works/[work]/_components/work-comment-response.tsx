import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { AvatarImage } from "@/components/ui/avatar"
import { Avatar } from "@radix-ui/react-avatar"

type Props = {
  userIconImageURL?: string
  userName?: string
  text?: string
  stickerImageURL?: string
  createdAt: number
}

export const WorkCommentResponse = (props: Props) => {
  return (
    <div className="flex items-start pl-16 space-x-2">
      <Avatar>
        <AvatarImage
          className="rounded-full w-12"
          src={props.userIconImageURL}
          alt=""
        />
      </Avatar>
      <div className="space-y-0">
        <p>{props.userName}</p>
        <p className="text-sm whitespace-pre-wrap overflow-hidden break-words">
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
