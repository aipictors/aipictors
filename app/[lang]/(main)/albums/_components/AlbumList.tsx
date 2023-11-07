"use client"

import { Stack } from "@chakra-ui/react"
import { AlbumCard } from "app/[lang]/(main)/albums/_components/AlbumCard"

export const AlbumList: React.FC = () => {
  return (
    <Stack>
      <AlbumCard />
    </Stack>
  )
}
