"use client"
import { HStack, Stack } from "@chakra-ui/react"
import { AlbumArticleHeader } from "app/[lang]/(main)/albums/[album]/components/AlbumArticleHeader"
import { AlbumWorkDescription } from "app/[lang]/(main)/albums/[album]/components/AlbumWorkDescription"
import { AlbumWorkList } from "app/[lang]/(main)/albums/[album]/components/AlbumWorkList"

export const AlbumArticle: React.FC = () => {
  return (
    <HStack alignItems={"flex-start"}>
      <Stack>
        <AlbumArticleHeader />
        <AlbumWorkList />
      </Stack>
      <AlbumWorkDescription />
    </HStack>
  )
}
