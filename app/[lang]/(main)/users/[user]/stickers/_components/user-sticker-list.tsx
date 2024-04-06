"use client"

import { StickerCard } from "@/[lang]/(main)/stickers/_components/sticker-card"
import type { UserStickersQuery } from "@/_graphql/__generated__/graphql"
import { Link } from "@remix-run/react"

type Props = {
  stickers: NonNullable<UserStickersQuery["user"]>["stickers"]
}

export const UserStickerList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-6">
      {props.stickers.map((props) => (
        <Link
          key={props.id}
          to={`https://www.aipictors.com/stamp/?id=${props.id}`}
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
