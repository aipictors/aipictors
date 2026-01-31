import { Link } from "@remix-run/react"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Download, MessageCircle } from "lucide-react"

type Props = {
  stickers: FragmentOf<typeof StickerListItemFragment>[]
}

/**
 * レスポンシブ対応のスタンプ一覧
 */
export function ResponsiveStickersList (props: Props): React.ReactNode {
  if (props.stickers.length === 0) {
    return null
  }

  const stickers = props.stickers.map((sticker) => {
    return readFragment(StickerListItemFragment, sticker)
  })

  return (
    <div className="flex flex-wrap">
      {stickers.map((sticker) => {
        return (
          <div key={sticker.id} className="m-2 overflow-hidden rounded-md">
            <Link
              to={`/stickers/${sticker.id}`}
              className="group relative block p-1"
            >
              <div className="overflow-hidden rounded-md">
                <img
                  className="m-auto max-w-32 rounded-md transition-transform duration-200 ease-in-out group-hover:scale-105"
                  src={sticker.imageUrl ?? ""}
                  alt={sticker.title}
                />
              </div>
              <div className="h-24 max-w-32 space-y-2 overflow-hidden rounded-md">
                <span className="text-ellipsis whitespace-nowrap text-sm">
                  {sticker.title}
                </span>
                <div className="flex items-center">
                  <Download size={16} />
                  <span>{sticker.downloadsCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle size={16} />
                  <span>{sticker.usesCount.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          </div>
        )
      })}
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
