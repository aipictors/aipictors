"use client"
import { Stack } from "@chakra-ui/react"
import { ViewerAlbumListItem } from "app/(main)/viewer/albums/components/ViewerAlbumListItem"

export const ViewerAlbumList: React.FC = () => {
  return (
    <Stack>
      <ViewerAlbumListItem />
    </Stack>
  )
}
