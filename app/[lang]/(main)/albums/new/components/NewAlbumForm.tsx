"use client"
import { Stack } from "@chakra-ui/react"
import { NewAlbumImage } from "app/[lang]/(main)/albums/new/components/NewAlbumImage"
import { NewAlbumWorkList } from "app/[lang]/(main)/albums/new/components/NewAlbumWorkList"

export const NewAlbumForm: React.FC = () => {
  return (
    <Stack>
      <NewAlbumImage />
      <NewAlbumWorkList />
    </Stack>
  )
}
