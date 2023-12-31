"use client"
import type { StickersQuery } from "@/__generated__/apollo"
import { StickerCard } from "@/app/[lang]/(beta)/stickers/_components/sticker-card"

type Props = {
  stickers: StickersQuery["stickers"]
}

export const StickerList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
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
