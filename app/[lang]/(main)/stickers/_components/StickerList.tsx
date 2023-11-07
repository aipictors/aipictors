"use client"
import { HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import type { StickersQuery } from "__generated__/apollo"
import { StickerCard } from "app/[lang]/(main)/stickers/_components/StickerCard"
import { StickerListHeader } from "app/[lang]/(main)/stickers/_components/StickerListHeader"
import React from "react"

type Props = {
  stickers: StickersQuery["stickers"]
}

export const StickerList: React.FC<Props> = (props) => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack>
        <StickerListHeader />
        <Text>{"新着"}</Text>
        <SimpleGrid
          columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
          spacing={2}
        >
          {props.stickers.map((props) => {
            return (
              <StickerCard
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
