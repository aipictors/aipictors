"use client"
import { Stack } from "@chakra-ui/react"
import { NewAlbumImage } from "app/[lang]/(main)/albums/new/_components/NewAlbumImage"
import { NewAlbumWorkList } from "app/[lang]/(main)/albums/new/_components/NewAlbumWorkList"
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
