"use client"

import { AlbumQuery, AlbumWorksQuery } from "@/__generated__/apollo"
import { SensitiveAlbumArticleHeader } from "@/app/[lang]/sensitive/albums/[album]/_components/sensitive-album-article-header"
import { SensitiveAlbumWorkDescription } from "@/app/[lang]/sensitive/albums/[album]/_components/sensitive-album-work-description"
import { SensitiveAlbumWorkList } from "@/app/[lang]/sensitive/albums/[album]/_components/sensitive-album-work-list"
import { HStack, Stack } from "@chakra-ui/react"

type Props = {
  albumQuery: AlbumQuery
  albumWorksQuery: AlbumWorksQuery
}

export const SensitiveAlbumArticle = (props: Props) => {
  return (
    <HStack alignItems={"flex-start"}>
      <Stack>
        <SensitiveAlbumArticleHeader />
        <SensitiveAlbumWorkList albumWorksQuery={props.albumWorksQuery} />
      </Stack>
      <SensitiveAlbumWorkDescription />
    </HStack>
  )
}
