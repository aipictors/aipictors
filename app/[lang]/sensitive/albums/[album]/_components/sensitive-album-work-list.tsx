"use client"

import { AlbumWork } from "@/app/[lang]/(main)/albums/[album]/_components/album-work"
import { AlbumWorksQuery } from "@/__generated__/apollo"

type Props = {
  albumWorksQuery: AlbumWorksQuery
}

export const SensitiveAlbumWorkList: React.FC<Props> = (props) => {
  return (
    <AlbumWork
      albumWorksQuery={props.albumWorksQuery}
      title={props.albumWorksQuery.album?.works?.[0]?.title ?? "Untitled"}
      thumbnailImageUrl={
        props.albumWorksQuery.album?.works?.[0]?.largeThumbnailImageURL ?? ""
      }
      likesCount={props.albumWorksQuery.album?.works?.[0]?.likesCount ?? 0}
      createdAt={props.albumWorksQuery.album?.works?.[0]?.createdAt ?? 0}
    />
  )
}
