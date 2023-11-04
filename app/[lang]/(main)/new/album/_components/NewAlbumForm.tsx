"use client"

import { Stack } from "@chakra-ui/react"
import { NewAlbumImage } from "app/[lang]/(main)/new/album/_components/NewAlbumImage"
import { NewAlbumWorkList } from "app/[lang]/(main)/new/album/_components/NewAlbumWorkList"

export const NewAlbumForm: React.FC = () => {
  return (
    <Stack>
      <NewAlbumImage />
      <NewAlbumWorkList />
    </Stack>
  )
}
