import type { partialStickerFieldsFragment } from "@/_graphql/fragments/partial-sticker-fields"
import { config } from "@/config"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { Download, MessageCircle } from "lucide-react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  stickers: FragmentOf<typeof partialStickerFieldsFragment>[]
  targetRowHeight?: number
}

/**
 * レスポンシブ対応のスタンプ一覧
 */
export const ResponsiveStickersList = (props: Props) => {
  if (props.stickers === null || props.stickers.length === 0) {
    return null
  }

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <div className="flex flex-wrap">
      {props.stickers.map((sticker) => (
        <div key={sticker.id} className="m-2 overflow-hidden rounded-md">
          <Link
            to={`https://www.aipictors.com/stamp/?id=${sticker.id}`}
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
