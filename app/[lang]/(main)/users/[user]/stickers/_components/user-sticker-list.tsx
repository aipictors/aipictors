"use client"

import { StickerCard } from "@/app/[lang]/(beta)/stickers/_components/sticker-card"
import type { UserStickersQuery } from "@/graphql/__generated__/graphql"
import Link from "next/link"

type Props = {
  stickers: NonNullable<UserStickersQuery["user"]>["stickers"]
}

export const UserStickerList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
      {props.stickers.map((props) => (
        <Link
          key={props.id}
          href={`https://www.aipictors.com/stamp/?id=${props.id}`}
        >
          <StickerCard
            title={props.title}
            imageURL={props.image?.downloadURL ?? null}
            downloadsCount={props.downloadsCount}
            usesCount={props.usesCount}
          />
        </Link>
      ))}
    </div>
  )
}
