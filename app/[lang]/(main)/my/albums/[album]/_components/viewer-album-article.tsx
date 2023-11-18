"use client"

import { ViewerAlbumArticleHeader } from "@/app/[lang]/(main)/my/albums/[album]/_components/viewer-album-article-header"
import { ViewerAlbumWorkDescription } from "@/app/[lang]/(main)/my/albums/[album]/_components/viewer-album-work-description"
import { ViewerAlbumWorkList } from "@/app/[lang]/(main)/my/albums/[album]/_components/viewer-album-work-list"

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
