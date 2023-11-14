"use client"

import { ViewerAlbumList } from "@/app/[lang]/(main)/my/albums/_components/vIewer-album-list"
import { ViewerAlbumAddModal } from "@/app/[lang]/(main)/my/albums/_components/viewer-album-add-modal"
import { HStack, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { Plus } from "lucide-react"

export const ViewerAlbumHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Stack spacing={4}>
        <Text>{"投稿作品をシリーズにまとめてシェアしてみよう！"}</Text>
        <HStack justifyContent={"center"}>
          <Plus />
        </HStack>
        <ViewerAlbumList />
      </Stack>
      <ViewerAlbumAddModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
