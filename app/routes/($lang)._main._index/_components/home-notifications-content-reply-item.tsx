import {} from "@/_components/ui/dropdown-menu"
import {} from "@/_components/ui/tabs"

type Props = {
  ownerUserId: string
  workId: string
  thumbnailUrl: string
  iconUrl: string
  stickerUrl: string
  comment: string
  userName: string
  createdAt: string
}

/**
 * ヘッダーの返信のお知らせ内容
 */
export const HomeNotificationsContentReplyItem = (props: Props) => {
  return (
    <>
      <a
        href={`/works/${props.workId}`}
        className="flex items-center p-1 transition-all hover:bg-zinc-100 hover:dark:bg-zinc-900"
      >
        <>
          <a href={`/users/${props.ownerUserId}`}>
            <img
              src={props.iconUrl}
              alt="thumbnail"
              className="h-8 w-8 rounded-full object-cover"
            />
          </a>
          <div className="ml-2 w-full max-w-64 overflow-hidden">
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
              <img src={props.stickerUrl} alt="sticker" className="h-12 w-12" />
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
        </>
      </a>
    </>
  )
}