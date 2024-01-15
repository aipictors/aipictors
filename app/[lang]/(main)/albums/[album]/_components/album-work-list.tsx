"use client"

import { AlbumWork } from "@/app/[lang]/(main)/albums/[album]/_components/album-work"
import { AlbumWorksQuery } from "@/graphql/__generated__/graphql"

type Props = {
  albumWorksQuery: AlbumWorksQuery
}

export const AlbumWorkList = (props: Props) => {
  return (
    <div className="flex flex-col">
      <AlbumWork
        albumWorksQuery={props.albumWorksQuery}
        title={props.albumWorksQuery.album?.works?.[0]?.title ?? "Untitled"}
        thumbnailImageUrl={
          props.albumWorksQuery.album?.works?.[0]?.largeThumbnailImageURL ?? ""
        }
        likesCount={props.albumWorksQuery.album?.works?.[0]?.likesCount ?? 0}
        createdAt={props.albumWorksQuery.album?.works?.[0]?.createdAt ?? 0}
      />
    </div>
  )
}
