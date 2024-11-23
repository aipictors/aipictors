import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { StickerCard } from "~/routes/($lang)._main.stickers._index/components/sticker-card"
import { Link } from "react-router";

type Props = {
  stickers: FragmentOf<typeof UserStickersItemFragment>[]
  page: number
}

export function UserStickerList(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex min-h-96 flex-col gap-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {props.stickers.map((sticker) => (
            <Link key={sticker.id} to={`/stickers/${sticker.id}`}>
              <StickerCard sticker={sticker} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export const UserStickersItemFragment = graphql(
  `fragment StickerItem on StickerNode @_unmask {
    id
    title
    imageUrl
    downloadsCount
    usesCount
  }`,
)
