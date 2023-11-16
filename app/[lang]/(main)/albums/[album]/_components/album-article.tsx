"use client"

import { AlbumQuery, AlbumWorksQuery } from "@/__generated__/apollo"
import { AlbumArticleHeader } from "@/app/[lang]/(main)/albums/[album]/_components/album-article-header"
import { AlbumWorkDescription } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-description"
import { AlbumWorkList } from "@/app/[lang]/(main)/albums/[album]/_components/album-work-list"

type Props = {
  albumQuery: AlbumQuery
  albumWorksQuery: AlbumWorksQuery
}

export const AlbumArticle = (props: Props) => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <AlbumArticleHeader albumQuery={props.albumQuery} />
        <AlbumWorkList albumWorksQuery={props.albumWorksQuery} />
      </div>
      <AlbumWorkDescription albumQuery={props.albumQuery} />
    </div>
  )
}
