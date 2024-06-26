import type { userStickersQuery } from "@/_graphql/queries/user/user-stickers"
import { StickerCard } from "@/routes/($lang)._main.stickers._index/_components/sticker-card"
import { Link } from "@remix-run/react"
import type { ResultOf } from "gql.tada"

type Props = {
  stickers: NonNullable<ResultOf<typeof userStickersQuery>["user"]>["stickers"]
}

export const UserStickerList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {props.stickers.map((sticker) => (
        <Link
          key={sticker.id}
          to={`https://www.aipictors.com/stamp/?id=${sticker.id}`}
        >
          <StickerCard
            title={sticker.title}
            imageURL={sticker.imageUrl}
            downloadsCount={sticker.downloadsCount}
            usesCount={sticker.usesCount}
          />
        </Link>
      ))}
    </div>
  )
}
