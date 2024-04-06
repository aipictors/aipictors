"use client"

import type { AlbumQuery } from "@/_graphql/__generated__/graphql"
import { ShareIcon } from "lucide-react"

type Props = {
  albumQuery: AlbumQuery
}

export const AlbumArticleHeader = (props: Props) => {
  return (
    <div className="flex flex-col">
      <img
        src={props.albumQuery.album?.thumbnailImage?.downloadURL!}
        alt={props.albumQuery.album?.title!}
      />
      <div className="flex">
        <p>{props.albumQuery.album?.title}</p>
        <ShareIcon>{"Twitterでシェア"}</ShareIcon>
      </div>
    </div>
  )
}
