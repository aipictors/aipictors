import { HeartIcon } from "lucide-react"

type Props = {
  message: string
  createdAt: string
}

/**
 * ヘッダーのいいね集計のお知らせ内容
 */
export function HomeNotificationsContentSumLikedItem(props: Props) {
  return (
    <>
      <div className="flex items-center p-1 transition-all">
        <HeartIcon className="mr-2 w-4" />
        <div className="ml-2 w-full overflow-hidden">
          <p className="text-ellipsis">{props.message}</p>
        </div>
      </div>
    </>
  )
}
