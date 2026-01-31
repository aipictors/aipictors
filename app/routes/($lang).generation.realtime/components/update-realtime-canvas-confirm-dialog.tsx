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
  updatedPaintCanvasBase64: () => void
}

export function UpdateRealtimeCanvasConfirmDialog (props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = () => {
    if (props.updatedPaintCanvasBase64) {
      props.updatedPaintCanvasBase64()
    }
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-2 left-2"
        >
          ベース画像にする
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認</AlertDialogTitle>
          <AlertDialogDescription>
            現在のキャンバスを上書きしますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleNext}>上書きする</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
