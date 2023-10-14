"use client"
import { HStack, SimpleGrid, Stack } from "@chakra-ui/react"
import type { StickersQuery } from "__generated__/apollo"
import { CardSticker } from "app/[lang]/(main)/stickers/components/CardSticker"
import { StickerListHeader } from "app/[lang]/(main)/stickers/components/StickerListHeader"
import React from "react"

type Props = {
  stickersQuery: StickersQuery
}

export const StickerList: React.FC<Props> = (props) => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack>
        <StickerListHeader />
        <SimpleGrid
          columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
          spacing={2}
        >
          {props.stickersQuery.stickers?.map((props) => {
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
      </Stack>
    </HStack>
  )
}
