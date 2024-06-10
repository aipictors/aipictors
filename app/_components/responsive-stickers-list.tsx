import type { stickersQuery } from "@/_graphql/queries/sticker/stickers"
import { config } from "@/config"
import type { ResultOf } from "gql.tada"
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
        <div
          key={sticker.id}
          className="m-2 h-16 w-32 overflow-hidden rounded-md md:h-24 md:w-40"
        >
          <a
            href={`https://www.aipictors.com/stamp/?id=${sticker.id}`}
            className="relative"
          >
            <img
              className="m-auto h-24 w-24"
              src={sticker.imageUrl ?? ""}
              alt={sticker.title}
            />
          </a>
        </div>
      ))}
    </div>
  )
}
