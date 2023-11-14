"use client"

import { HStack, Stack, Text } from "@chakra-ui/react"
import { Pencil, Plus, Share } from "lucide-react"

export const ViewerAlbumArticleHeader = () => {
  return (
    <Stack spacing={4}>
      <HStack justifyContent={"space-between"}>
        <Pencil />
        <Share>{"Twitterでシェア"}</Share>
      </HStack>
      <Text fontSize={"sm"}> {"選択後、ドラッグで並び替えできます"}</Text>
      <HStack justifyContent={"center"}>
        <Plus />
      </HStack>
      <HStack justifyContent={"space-between"} />
    </Stack>
  )
}
