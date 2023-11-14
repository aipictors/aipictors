"use client"

import { AlbumQuery } from "@/__generated__/apollo"
import { HStack, Image, Stack, Text } from "@chakra-ui/react"
import { Share } from "lucide-react"

type Props = {
  albumQuery: AlbumQuery
}

export const AlbumArticleHeader = (props: Props) => {
  return (
    <Stack>
      <Image
        src={props.albumQuery.album?.thumbnailImage?.downloadURL!}
        alt={props.albumQuery.album?.title!}
        borderRadius={"md"}
      />
      <HStack justifyContent={"space-between"}>
        <Text>{props.albumQuery.album?.title}</Text>
        <Share>{"Twitterでシェア"}</Share>
      </HStack>
    </Stack>
  )
}
