"use client"

import { HStack, Stack } from "@chakra-ui/react"
import { ViewerAlbumArticleHeader } from "app/[lang]/(main)/my/albums/[album]/_components/viewer-album-article-header"
import { ViewerAlbumWorkDescription } from "app/[lang]/(main)/my/albums/[album]/_components/viewer-album-work-description"
import { ViewerAlbumWorkList } from "app/[lang]/(main)/my/albums/[album]/_components/viewer-album-work-list"

export const MyAlbum: React.FC = () => {
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
