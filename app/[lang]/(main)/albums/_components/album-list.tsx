"use client"

import { Stack } from "@chakra-ui/react"
import { AlbumCard } from "app/[lang]/(main)/albums/_components/album-card"

export const AlbumList: React.FC = () => {
  return (
    <Stack>
      <AlbumCard />
    </Stack>
  )
}
