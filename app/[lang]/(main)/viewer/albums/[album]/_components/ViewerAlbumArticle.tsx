"use client"
import { HStack, Stack } from "@chakra-ui/react"
import { ViewerAlbumArticleHeader } from "app/[lang]/(main)/viewer/albums/[album]/_components/ViewerAlbumArticleHeader"
import { ViewerAlbumWorkDescription } from "app/[lang]/(main)/viewer/albums/[album]/_components/ViewerAlbumWorkDescription"
import { ViewerAlbumWorkList } from "app/[lang]/(main)/viewer/albums/[album]/_components/ViewerAlbumWorkList"

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
