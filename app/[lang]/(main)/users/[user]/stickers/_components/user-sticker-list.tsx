"use client"

import type { UserStickersQuery } from "@/__generated__/apollo"
import { StickerCard } from "@/app/[lang]/(main)/stickers/_components/sticker-card"

type Props = {
  stickers: NonNullable<UserStickersQuery["user"]>["stickers"]
}

export const UserStickerList = (props: Props) => {
  return (
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
  )
}
