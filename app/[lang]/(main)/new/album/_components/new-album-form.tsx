"use client"

import { Stack } from "@chakra-ui/react"
import { NewAlbumImage } from "app/[lang]/(main)/new/album/_components/new-album-image"
import { NewAlbumWorkList } from "app/[lang]/(main)/new/album/_components/new-album-work-list"

export const NewAlbumForm: React.FC = () => {
  return (
    <Stack>
      <NewAlbumImage />
      <NewAlbumWorkList />
    </Stack>
  )
}
