import {
  StickerCard,
  StickerCardFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-card"
import { Link } from "react-router"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  stickers: FragmentOf<typeof UserStickerListItemFragment>[]
}

export function UserStickerList(props: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {props.stickers.map((sticker) => (
        <Link key={sticker.id} to={`/stickers/${sticker.id}`}>
          <StickerCard sticker={sticker} />
        </Link>
      ))}
    </div>
  )
}

export const UserStickerListItemFragment = graphql(
  `fragment UserStickerListItem on StickerNode @_unmask {
    ...StickerCard
  }`,
  [StickerCardFragment],
)
