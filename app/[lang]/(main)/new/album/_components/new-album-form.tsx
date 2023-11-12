"use client"

import { NewAlbumImage } from "@/app/[lang]/(main)/new/album/_components/new-album-image"
import { NewAlbumWorkList } from "@/app/[lang]/(main)/new/album/_components/new-album-work-list"
import { Stack } from "@chakra-ui/react"

export const NewAlbumForm: React.FC = () => {
  return (
    <Stack>
      <NewAlbumImage />
      <NewAlbumWorkList />
    </Stack>
  )
}
