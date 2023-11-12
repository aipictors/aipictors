"use client"

import { StickerCard } from "@/app/[lang]/(main)/stickers/_components/sticker-card"
import { SimpleGrid } from "@chakra-ui/react"
import type { UserStickersQuery } from "@/__generated__/apollo"
import React from "react"

type Props = {
  stickers: NonNullable<UserStickersQuery["user"]>["stickers"]
}

export const UserStickerList: React.FC<Props> = (props) => {
  return (
    <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={2}>
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
    </SimpleGrid>
  )
}
