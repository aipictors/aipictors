"use client"
import type { StickersQuery } from "@/__generated__/apollo"
import { StickerCard } from "@/app/[lang]/(main)/stickers/_components/sticker-card"

type Props = {
  stickers: StickersQuery["stickers"]
}

export const StickerList = (props: Props) => {
  return (
    <main className="flex justify-center w-full px-4">
      <div className="flex flex-col">
        <p>新着</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {props.stickers.map((props) => {
            return (
              <StickerCard
                key={props.id}
                id={props.id}
                title={props.title}
                imageURL={props.image?.downloadURL ?? null}
                downloadsCount={props.downloadsCount}
                usesCount={props.usesCount}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}
