"use client"
import { HStack, Stack } from "@chakra-ui/react"
import { ViewerAlbumArticleHeader } from "app/(main)/viewer/albums/[album]/components/ViewerAlbumArticleHeader"
import { ViewerAlbumWorkDescription } from "app/(main)/viewer/albums/[album]/components/ViewerAlbumWorkDescription"
import { ViewerAlbumWorkList } from "app/(main)/viewer/albums/[album]/components/ViewerAlbumWorkList"

export const ViewerAlbumArticle: React.FC = () => {
  return (
    <HStack alignItems={"flex-start"} spacing={8}>
      <Stack spacing={4}>
        <ViewerAlbumArticleHeader />
        <ViewerAlbumWorkList />
      </Stack>
      <ViewerAlbumWorkDescription />
    </HStack>
  )
}
