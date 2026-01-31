import { Button } from "~/components/ui/button"
import { CreateAlbumDialog } from "~/routes/($lang).my._index/components/create-album-dialog"
import { PlusIcon } from "lucide-react"

type Props = {
  refetch: () => void
}

/**
 * シリーズ追加ボタン
 */
export function WorksSeriesAddButton (props: Props) {
  return (
    <>
      <CreateAlbumDialog refetch={props.refetch}>
        <div className="border-2 border-transparent p-1">
          <Button
            className="h-12 w-full rounded-md bg-transparent"
            onClick={() => {}}
            size={"icon"}
            variant={"secondary"}
          >
            <PlusIcon />
          </Button>
        </div>
      </CreateAlbumDialog>
    </>
  )
}
