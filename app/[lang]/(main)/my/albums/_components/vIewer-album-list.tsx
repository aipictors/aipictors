"use client"

import { ViewerAlbum } from "@/app/[lang]/(main)/my/albums/_components/viewer-album"
import { HStack } from "@chakra-ui/react"

export const ViewerAlbumList = () => {
  return (
    <HStack spacing={4}>
      <ViewerAlbum />
      <ViewerAlbum />
      <ViewerAlbum />
      <ViewerAlbum />
    </HStack>
  )
}
