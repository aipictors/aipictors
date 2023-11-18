import { toDateTimeText } from "@/app/_utils/to-date-time-text"

type Props = {
  userIconImageURL?: string
  userName?: string
  text?: string
  stickerImageURL?: string
  createdAt: number
}

export const WorkCommentResponse = (props: Props) => {
  return (
    <div className="flex items-start pl-16">
      <img className="rounded-full" src={props.userIconImageURL} alt="" />
      <div className="space-y-0">
        <p>{props.userName}</p>
        <p>{props.text}</p>
        {props.stickerImageURL && (
          <img className="w-8" alt="" src={props.stickerImageURL} />
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
