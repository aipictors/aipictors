"use client"
import { StickerCard } from "@/app/[lang]/(beta)/stickers/_components/sticker-card"
import type { StickersQuery } from "@/graphql/__generated__/graphql"

type Props = {
  stickers: StickersQuery["stickers"]
}

export const StickerList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
      {props.stickers.map((props) => (
        <a
          key={props.id}
          href={`https://www.aipictors.com/stamp/?id=${props.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <StickerCard
            title={props.title}
            imageURL={props.image?.downloadURL ?? null}
            downloadsCount={props.downloadsCount}
            usesCount={props.usesCount}
          />
        </a>
      ))}
    </div>
  )
}
