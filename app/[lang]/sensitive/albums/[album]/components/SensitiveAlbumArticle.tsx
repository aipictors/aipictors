"use client"

import { HStack, Stack } from "@chakra-ui/react"
import { AlbumQuery, AlbumWorksQuery } from "__generated__/apollo"
import { SensitiveAlbumArticleHeader } from "app/[lang]/sensitive/albums/[album]/components/SensitiveAlbumArticleHeader"
import { SensitiveAlbumWorkDescription } from "app/[lang]/sensitive/albums/[album]/components/SensitiveAlbumWorkDescription"
import { SensitiveAlbumWorkList } from "app/[lang]/sensitive/albums/[album]/components/SensitiveAlbumWorkList"

type Props = {
  albumQuery: AlbumQuery
  albumWorksQuery: AlbumWorksQuery
}

export const SensitiveAlbumArticle: React.FC<Props> = (props) => {
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
