"use client"
import { Stack, Text } from "@chakra-ui/react"
import { AlbumArticleHeader } from "app/(main)/albums/[album]/components/AlbumArticleHeader"

export const AlbumArticle: React.FC = () => {
  return (
    <Stack>
      <Text>{"アルバム"}</Text>
      <AlbumArticleHeader />
    </Stack>
  )
}
