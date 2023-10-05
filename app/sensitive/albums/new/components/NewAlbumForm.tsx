"use client"
import { Stack } from "@chakra-ui/react"
import { NewAlbumImage } from "app/(main)/albums/new/components/NewAlbumImage"
import { NewAlbumWorkList } from "app/(main)/albums/new/components/NewAlbumWorkList"

export const NewAlbumForm: React.FC = () => {
  return (
    <Stack>
      <NewAlbumImage />
      <NewAlbumWorkList />
    </Stack>
  )
}
