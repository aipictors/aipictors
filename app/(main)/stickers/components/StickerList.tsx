"use client"
import { HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import React from "react"
import type { StickersQuery } from "__generated__/apollo"
import { CardSticker } from "app/(main)/stickers/components/CardSticker"

type Props = {
  stickersQuery: StickersQuery
}

export const StickerList: React.FC<Props> = (props) => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"AIイラストスタンプ広場"}
        </Text>
        <Text fontSize={"sm"}>
          {
            "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！"
          }
        </Text>
        <SimpleGrid minChildWidth="120px" spacing={2}>
          {props.stickersQuery.stickers?.map((props) => {
            return (
              <CardSticker
                key={props.id}
                title={props.title}
                imageURL={props.image?.downloadURL ?? null}
                downloadsCount={props.downloadsCount}
                usesCount={props.usesCount}
                likesCount={props.likesCount}
              />
            )
          })}
        </SimpleGrid>
      </Stack>
    </HStack>
  )
}
