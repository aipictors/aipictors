"use client"

import { Stack } from "@chakra-ui/react"

import { SensitiveNewAlbumImage } from "app/[lang]/sensitive/albums/new/components/SensitiveNewAlbumImage"
import { SensitiveNewAlbumWorkList } from "app/[lang]/sensitive/albums/new/components/SensitiveNewAlbumWorkList"

export const SensitiveNewAlbumForm: React.FC = () => {
  return (
    <Stack>
      <SensitiveNewAlbumImage />
      <SensitiveNewAlbumWorkList />
    </Stack>
  )
}
