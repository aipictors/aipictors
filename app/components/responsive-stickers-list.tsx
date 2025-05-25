import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { Download, MessageCircle } from "lucide-react"

type Props = {
  stickers: FragmentOf<typeof StickerListItemFragment>[]
  targetRowHeight?: number
}

/**
 * レスポンシブ対応のスタンプ一覧
 */
export function ResponsiveStickersList(props: Props) {
  // Remove redundant null check as TypeScript type guarantees it's not null
  if (props.stickers.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap">
      {props.stickers.map((sticker) => (
        <div key={sticker.id} className="m-2 overflow-hidden rounded-md">
          <Link
            to={`/stickers/${sticker.id}`}
            className="group relative block p-1"
          >
            <div className="overflow-hidden rounded-md">
              <img
                className="m-auto max-w-32 rounded-md transition-transform duration-200 ease-in-out group-hover:scale-105"
                src={sticker.imageUrl}
                alt={sticker.title}
              />
            </div>
            <div className="h-24 max-w-32 space-y-2 overflow-hidden rounded-md">
              <span className="text-ellipsis text-nowrap text-sm">
                {sticker.title}
              </span>
              <div className="flex items-center">
                <Download size={16} />
                <span>{sticker.downloadsCount}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle size={16} />
                <span>{sticker.usesCount}</span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

export const StickerListItemFragment = graphql(
  `fragment StickerListItem on StickerNode {
    id
    title
    downloadsCount
    usesCount
    imageUrl
  }`,
)
