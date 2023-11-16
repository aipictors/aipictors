"use client"

import { ViewerAlbum } from "@/app/[lang]/(main)/my/albums/_components/viewer-album"

export const ViewerAlbumList = () => {
  return (
    <div className="flex">
      <ViewerAlbum />
      <ViewerAlbum />
      <ViewerAlbum />
      <ViewerAlbum />
    </div>
  )
}
