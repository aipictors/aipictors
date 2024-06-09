type Props = {
  workId: string
  imageUrl: string
  title: string
  text: string
  tags: string[]
}

/**
 * ノベル作品をプレビューして表示するコンポーネント
 */
export const NovelWorkPreviewItem = (props: Props) => {
  return (
    <a
      href={`/works/${props.workId}`}
      className="relative transition-all duration-300 ease-in-out hover:opacity-80"
    >
      <div className={"relative overflow-hidden rounded"}>
        <img
          src={props.imageUrl}
          alt="novel work preview"
          className={"w-full max-w-40 rounded md:max-w-none"}
        />
      </div>
      <div className="mt-2 max-h-48 w-48 space-y-2 overflow-hidden text-ellipsis md:w-64">
        <div className="overflow-hidden font-bold text-sm">{props.title}</div>
        <div className="h-16 overflow-hidden text-ellipsis text-wrap text-gray-500 text-xs">
          {props.text}
        </div>
        {/* <div className="mt-1 flex flex-wrap space-x-1">
          {props.tags.map((tag, index: number) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Badge variant={"secondary"} key={index} className="text-xs">
              {tag}
            </Badge>
          ))}
        </div> */}
      </div>
    </a>
  )
}
