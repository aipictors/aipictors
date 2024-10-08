import { Link } from "@remix-run/react"

type Props = {
  workId: string
  imageUrl: string
  title: string
  text: string
}

/**
 * ノベル作品をプレビューして表示するコンポーネント
 */
export function NovelWorkPreviewItem(props: Props) {
  return (
    <Link
      to={`/posts/${props.workId}`}
      className="group relative transition-all duration-300 ease-in-out"
    >
      <div className={"relative overflow-hidden rounded"}>
        <img
          src={props.imageUrl}
          alt="novel work preview"
          className={
            "w-full max-w-40 rounded transition-transform duration-300 group-hover:scale-105 md:max-w-64"
          }
        />
      </div>
      <div className="mt-2 h-24 w-40 space-y-2 overflow-hidden text-ellipsis p-2 md:w-64">
        <div className="h-6 overflow-hidden font-bold text-sm">
          {props.title}
        </div>
        <div className="h-8 overflow-hidden text-ellipsis text-wrap text-xs">
          {props.text}
        </div>
      </div>
    </Link>
  )
}
