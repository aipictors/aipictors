import { TrashIcon } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
type Props = {
  onDelete: () => Promise<void>
  seriesTitle: string
}

export function AlbumDeleteConfirmDialog(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = async () => {
    await props.onDelete()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div
          onClick={() => setIsOpen(true)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsOpen(true)
          }}
        >
          <TrashIcon />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認</AlertDialogTitle>
          <AlertDialogDescription>
            {`シリーズ「${props.seriesTitle}」を削除しますか？`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleNext}>削除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
