import {
  StickerCard,
  StickerCardFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-card"
import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  stickers: FragmentOf<typeof StickerListItemFragment>[]
  /** ページの最初に出す一覧。最初に見える行の画像を遅延させない */
  isFirstView?: boolean
}

/** スマホで 3 枚 2 行、PC で 1 行ぶんくらい */
const EAGER_IMAGES_COUNT = 6

export function StickerList (props: Props) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {props.stickers.map((sticker, index) => (
        <Link key={sticker.id} to={`/stickers/${sticker.id}`} className="min-w-0">
          <StickerCard
            sticker={sticker}
            isEager={props.isFirstView === true && index < EAGER_IMAGES_COUNT}
          />
        </Link>
      ))}
    </div>
  )
}

export const StickerListItemFragment = graphql(
  `fragment StickerListItem on StickerNode @_unmask {
    ...StickerCard
  }`,
  [StickerCardFragment],
)
