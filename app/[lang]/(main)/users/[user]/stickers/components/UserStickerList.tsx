"use client"
import { SimpleGrid } from "@chakra-ui/react"
import type { UserStickersQuery } from "__generated__/apollo"
import { CardSticker } from "app/[lang]/(main)/stickers/components/CardSticker"
import React from "react"

type Props = {
  stickers: NonNullable<UserStickersQuery["user"]>["stickers"]
}

export const UserStickerList: React.FC<Props> = (props) => {
  return (
    <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={2}>
      {props.stickers.map((props) => {
        return (
          <CardSticker
            key={props.id}
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
