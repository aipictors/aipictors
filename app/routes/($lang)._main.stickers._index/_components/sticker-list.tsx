"use client"
import type { StickersQuery } from "@/_graphql/__generated__/graphql"
import { StickerCard } from "@/routes/($lang)._main.stickers._index/_components/sticker-card"

type Props = {
  stickers: StickersQuery["stickers"]
}

export const StickerList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
      {props.stickers.map((sticker) => (
        <a
          key={sticker.id}
          href={`https://www.aipictors.com/stamp/?id=${sticker.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <StickerCard
            title={sticker.title}
            imageURL={sticker?.imageUrl}
            downloadsCount={sticker.downloadsCount}
            usesCount={sticker.usesCount}
          />
        </a>
      ))}
    </div>
  )
}
