import { LibraryBigIcon, PlusIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { CreateAlbumDialog } from "~/routes/($lang).my._index/components/create-album-dialog"

type Props = {
  refetch: () => void
  /** シリーズが 1 つもないときは、説明つきの大きな案内にする */
  isEmpty?: boolean
}

/**
 * シリーズ作成ボタン
 */
export function WorksSeriesAddButton(props: Props) {
  if (props.isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LibraryBigIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold">シリーズを作ってみましょう</p>
          <p className="text-muted-foreground text-sm">
            連作やテーマごとに作品をまとめて、1つのページで見てもらえます
          </p>
        </div>
        <CreateAlbumDialog refetch={props.refetch}>
          <Button className="gap-1.5">
            <PlusIcon className="size-4" />
            シリーズを作成
          </Button>
        </CreateAlbumDialog>
      </div>
    )
  }

  return (
    <CreateAlbumDialog refetch={props.refetch}>
      <Button className="gap-1.5">
        <PlusIcon className="size-4" />
        シリーズを作成
      </Button>
    </CreateAlbumDialog>
  )
}
