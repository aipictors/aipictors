"use client"

import { ViewerAlbumList } from "@/app/[lang]/(main)/my/albums/_components/vIewer-album-list"
import { ViewerAlbumAddDialog } from "@/app/[lang]/(main)/my/albums/_components/viewer-album-add-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useBoolean } from "usehooks-ts"

export const ViewerAlbumHeader = () => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <div className="flex flex-col">
        <p>{"投稿作品をシリーズにまとめてシェアしてみよう！"}</p>
        <div className="flex flex-col">
          <Button onClick={onOpen}>
            <Plus />
          </Button>
        </div>
        <ViewerAlbumList />
      </div>
      <ViewerAlbumAddDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
