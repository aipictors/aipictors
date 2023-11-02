"use client"
import { HStack, Stack, Text } from "@chakra-ui/react"
import { SensitiveAlbumArticleHeader } from "app/[lang]/sensitive/albums/[album]/components/SensitiveAlbumArticleHeader"
import { SensitiveAlbumWorkDescription } from "app/[lang]/sensitive/albums/[album]/components/SensitiveAlbumWorkDescription"
import { SensitiveAlbumWorkList } from "app/[lang]/sensitive/albums/[album]/components/SensitiveAlbumWorkList"

export const SensitiveAlbumArticle: React.FC = () => {
  return (
    <HStack alignItems={"flex-start"}>
      <Stack>
        <SensitiveAlbumArticleHeader />
        <SensitiveAlbumWorkList />
      </Stack>
      <SensitiveAlbumWorkDescription />
    </HStack>
  )
}
