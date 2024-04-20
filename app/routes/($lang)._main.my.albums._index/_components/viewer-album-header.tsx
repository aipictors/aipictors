import { Button } from "@/_components/ui/button"
import { ViewerAlbumList } from "@/routes/($lang)._main.my.albums._index/_components/vIewer-album-list"
import { ViewerAlbumAddDialog } from "@/routes/($lang)._main.my.albums._index/_components/viewer-album-add-dialog"
import { PlusIcon } from "lucide-react"
import { useBoolean } from "usehooks-ts"

export const ViewerAlbumHeader = () => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <div className="flex flex-col">
        <p>{"投稿作品をシリーズにまとめてシェアしてみよう！"}</p>
        <div className="flex flex-col">
          <Button onClick={onOpen}>
            <PlusIcon />
          </Button>
        </div>
        <ViewerAlbumList />
      </div>
      <ViewerAlbumAddDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
