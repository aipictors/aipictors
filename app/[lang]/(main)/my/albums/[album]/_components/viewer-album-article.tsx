"use client"

import { ViewerAlbumArticleHeader } from "@/[lang]/(main)/my/albums/[album]/_components/viewer-album-article-header"
import { ViewerAlbumWorkDescription } from "@/[lang]/(main)/my/albums/[album]/_components/viewer-album-work-description"
import { ViewerAlbumWorkList } from "@/[lang]/(main)/my/albums/[album]/_components/viewer-album-work-list"

export const MyAlbum = () => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <ViewerAlbumArticleHeader />
        <ViewerAlbumWorkList />
      </div>
      <ViewerAlbumWorkDescription />
    </div>
  )
}
