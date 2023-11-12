"use client"

import { Stack } from "@chakra-ui/react"

import { SensitiveNewAlbumImage } from "app/[lang]/sensitive/albums/new/_components/sensitive-new-album-image"
import { SensitiveNewAlbumWorkList } from "app/[lang]/sensitive/albums/new/_components/sensitive-new-album-work-list"

export const SensitiveNewAlbumForm: React.FC = () => {
  return (
    <Stack>
      <SensitiveNewAlbumImage />
      <SensitiveNewAlbumWorkList />
    </Stack>
  )
}
