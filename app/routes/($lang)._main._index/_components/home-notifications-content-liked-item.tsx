import {} from "@/_components/ui/dropdown-menu"
import {} from "@/_components/ui/tabs"

type Props = {
  workId: string
  thumbnailUrl: string
  iconUrl: string
  title: string
  userName: string
  createdAt: string
}

/**
 * ヘッダーのいいねのお知らせ内容
 */
export const HomeNotificationsContentLikedItem = (props: Props) => {
  return (
    <>
      <a
        href={`/works/${props.workId}`}
        className="flex items-center p-1 transition-all hover:bg-zinc-100 hover:dark:bg-zinc-900"
      >
        <>
          <div className="h-12 w-12 overflow-hidden rounded-md">
            <img
              src={props.thumbnailUrl}
              alt="thumbnail"
              className="h-16 w-16 object-cover"
            />
          </div>
          <div className="ml-2 w-full overflow-hidden">
            <p className="text-ellipsis">
              {props.userName}さんからいいねされました！
            </p>
            <p className="text-sm opacity-80">{props.createdAt}</p>
          </div>
        </>
      </a>
    </>
  )
}
