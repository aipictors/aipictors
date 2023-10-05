"use client"
import { Stack } from "@chakra-ui/react"
import { AlbumWork } from "app/(main)/albums/[album]/components/AlbumWork"

export const AlbumWorkList: React.FC = () => {
  return (
    <Stack>
      <AlbumWork />
    </Stack>
  )
}
