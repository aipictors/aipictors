import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

type Props = {
  userIconImageURL?: string
  userName?: string
  text?: string
  stickerImageURL?: string
  createdAt: number
}

export const WorkComment = (props: Props) => {
  return (
    <div className="flex items-start space-x-2">
      <Avatar>
        <AvatarImage
          className="rounded-full w-12"
          src={props.userIconImageURL}
          alt=""
        />
      </Avatar>
      <div className="space-y-0">
        <span>{props.userName}</span>
        {props.text && <p className="text-sm">{props.text}</p>}
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
