import { Button } from "@/_components/ui/button"
import { CreateAlbumDialog } from "@/routes/($lang).dashboard._index/_components/create-album-dialog"

/**
 * シリーズ追加ボタン
 */
export const WorksSeriesAddButton = () => {
  return (
    <>
      <CreateAlbumDialog>
        <Button
          className="ml-auto block"
          variant={"secondary"}
          onClick={() => {}}
        >
          追加
        </Button>
      </CreateAlbumDialog>
    </>
  )
}
