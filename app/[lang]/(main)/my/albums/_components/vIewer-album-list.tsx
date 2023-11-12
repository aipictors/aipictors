"use client"

import { HStack } from "@chakra-ui/react"
import { ViewerAlbum } from "app/[lang]/(main)/my/albums/_components/viewer-album"

export const ViewerAlbumList: React.FC = () => {
  return (
    <HStack spacing={4}>
      <ViewerAlbum />
      <ViewerAlbum />
      <ViewerAlbum />
      <ViewerAlbum />
    </HStack>
  )
}
