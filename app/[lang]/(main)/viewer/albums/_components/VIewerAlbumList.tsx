"use client"
import { HStack } from "@chakra-ui/react"
import { ViewerAlbum } from "app/[lang]/(main)/viewer/albums/_components/ViewerAlbum"

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
