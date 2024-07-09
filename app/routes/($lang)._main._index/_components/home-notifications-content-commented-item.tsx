import { IconUrl } from "@/_components/icon-url"
import { Badge } from "@/_components/ui/badge"
import {} from "@/_components/ui/dropdown-menu"
import {} from "@/_components/ui/tabs"
import { Link } from "@remix-run/react"

type Props = {
  workId: string
  thumbnailUrl: string
  iconUrl: string
  stickerUrl: string
  comment: string
  userName: string
  createdAt: string
  isReplied: boolean // 返信済みかどうか
  repliedItem: {
    id: string
    comment: string
    user: {
      id: string
      name: string
      iconUrl: string
    }
    stickerUrl: string
  } | null
}

/**
 * ヘッダーのコメントのお知らせ内容
 */
export const HomeNotificationsContentCommentedItem = (props: Props) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1 border-b p-1">
        <Link
          to={`/posts/${props.workId}`}
          className="flex items-center rounded-md p-1 transition-all hover:bg-card"
        >
          <>
            <img
              src={IconUrl(props.iconUrl)}
              alt="thumbnail"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="ml-2 w-full overflow-hidden">
              <p className="text-ellipsis">
                {props.userName}さんがコメントしました
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
                  className="h-12 w-12"
                />
              )}
              <div className="flex items-center space-x-2">
                <p className="text-sm opacity-80">{props.createdAt}</p>
                {props.isReplied && <Badge variant="secondary">返信済み</Badge>}
              </div>
            </div>
            <div className="h-12 w-12 overflow-hidden rounded-md">
              <img
                src={props.thumbnailUrl}
                alt="thumbnail"
                className="h-16 w-16 object-cover"
              />
            </div>
          </>
        </Link>
        {props.repliedItem && (
          <div className="ml-12 flex items-center space-x-2">
            <img
              src={IconUrl(props.repliedItem.user.iconUrl)}
              alt="thumbnail"
              className="h-8 w-8 rounded-full object-cover"
            />
            <p className="text-ellipsis">
              {props.repliedItem.user.name}返信しました
              {props.repliedItem.comment && (
                <>
                  {"「"}
                  {props.repliedItem.comment}
                  {"」"}
                </>
              )}
            </p>

            <p className="text-ellipsis">
              {props.repliedItem.comment && (
                <>
                  {"「"}
                  {props.repliedItem.comment}
                  {"」"}
                </>
              )}
            </p>
            {props.repliedItem.stickerUrl && (
              <img
                src={props.repliedItem.stickerUrl}
                alt="sticker"
                className="h-12 w-12"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
