import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/_components/ui/dialog"
import { viewerStickersQuery } from "@/_graphql/queries/viewer/viewer-stickers"
import { useQuery } from "@apollo/client/index.js"
import { PlusIcon } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose(): void
}

/**
 * スタンプ送信ダイアログ
 */
export const StampDialog = (props: Props) => {
  const { data: stickers, refetch } = useQuery(viewerStickersQuery, {
    variables: {
      limit: 124,
      offset: 0,
    },
  })

  return (
    <Dialog onOpenChange={props.onClose} open={props.isOpen}>
      <DialogContent>
        <DialogHeader>
          <p>{"スタンプ選択"}</p>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-2">
          {stickers?.viewer?.stickers?.map((sticker) => (
            <Button key={sticker.id} size={"icon"} variant={"secondary"}>
              <img src={sticker.image?.downloadURL} alt={sticker.title} />
            </Button>
          ))}
          <Button size={"icon"} variant={"secondary"}>
            <PlusIcon />
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={props.onClose}>{"送信"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
