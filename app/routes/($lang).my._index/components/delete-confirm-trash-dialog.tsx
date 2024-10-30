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
import { Button } from "~/components/ui/button"

type Props = {
  onDelete: () => Promise<void>
  workTitle: string
  isLoadingDeleteWork: boolean
}

export function DeleteConfirmTrashDialog(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = async () => {
    await props.onDelete()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex w-full items-center space-x-2"
          onClick={() => setIsOpen(true)}
        >
          <TrashIcon
            className={props.isLoadingDeleteWork ? "opacity-80" : ""}
          />
          <p>削除する</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認</AlertDialogTitle>
          <AlertDialogDescription>
            {`作品「${props.workTitle}」を削除しますか？`}
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
