"use client"

import { AlbumCard } from "@/app/[lang]/(main)/albums/_components/album-card"
import { Stack } from "@chakra-ui/react"

export const AlbumList: React.FC = () => {
  return (
    <Stack>
      <AlbumCard />
    </Stack>
  )
}
