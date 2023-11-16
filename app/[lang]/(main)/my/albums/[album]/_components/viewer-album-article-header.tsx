"use client"

import { Pencil, Plus, Share } from "lucide-react"

export const ViewerAlbumArticleHeader = () => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <Pencil />
        <Share>{"Twitterでシェア"}</Share>
      </div>
      <p className="text-sm"> {"選択後、ドラッグで並び替えできます"}</p>
      <div className="flex">
        <Plus />
      </div>
      <div className="flex" />
    </div>
  )
}
