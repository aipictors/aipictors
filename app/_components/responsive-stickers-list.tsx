import type { stickersQuery } from "@/_graphql/queries/sticker/stickers"
import { config } from "@/config"
import type { ResultOf } from "gql.tada"
import { Download, MessageCircle } from "lucide-react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  stickers: NonNullable<ResultOf<typeof stickersQuery>["stickers"]> | null
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
        <div key={sticker.id} className="m-2 rounded-md">
          <a
            href={`https://www.aipictors.com/stamp/?id=${sticker.id}`}
            className="relative p-1 hover:opacity-80"
          >
            <img
              className="m-auto max-w-32"
              src={sticker.imageUrl ?? ""}
              alt={sticker.title}
            />
            <div className="h-24 max-w-32 space-y-2 overflow-hidden rounded-md">
              <span className="text-ellipsis text-nowrap text-sm">
                {sticker.title}
              </span>
              <div className="flex items-center">
                <MessageCircle size={16} />
                <span>{sticker.usesCount}</span>
              </div>
              <div className="flex items-center">
                <Download />
                <span>{sticker.downloadsCount}</span>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}
