"use client"

import { AlbumArticleHeader } from "@/app/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-list"
import { HStack, Stack } from "@chakra-ui/react"
import { AlbumQuery, AlbumWorksQuery } from "@/__generated__/apollo"

type Props = {
  albumQuery: AlbumQuery
  albumWorksQuery: AlbumWorksQuery
}

export const AlbumArticle: React.FC<Props> = (props) => {
  return (
    <HStack alignItems={"flex-start"}>
      <Stack>
        <AlbumArticleHeader albumQuery={props.albumQuery} />
        <AlbumWorkList albumWorksQuery={props.albumWorksQuery} />
      </Stack>
      <AlbumWorkDescription albumQuery={props.albumQuery} />
    </HStack>
  )
}
