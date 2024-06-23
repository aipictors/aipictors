import type { stickersQuery } from "@/_graphql/queries/sticker/stickers"
import { StickerCard } from "@/routes/($lang)._main.stickers._index/_components/sticker-card"
import { Link } from "@remix-run/react"
import type { ResultOf } from "gql.tada"

type Props = {
  stickers: ResultOf<typeof stickersQuery>["stickers"]
}

export const StickerList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
      {props.stickers.map((sticker) => (
        <Link
          key={sticker.id}
          to={`https://www.aipictors.com/stamp/?id=${sticker.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <StickerCard
            title={sticker.title}
            imageURL={sticker?.imageUrl}
            downloadsCount={sticker.downloadsCount}
            usesCount={sticker.usesCount}
          />
        </Link>
      ))}
    </div>
  )
}
