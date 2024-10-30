import { RotateCcw } from "lucide-react"
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
  onReset: () => void
}

export function GenerationConfigResetConfirmDialog(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = () => {
    props.onReset()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div
          className="flex w-full flex-col gap-y-2"
          onClick={() => setIsOpen(true)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsOpen(true)
            }
          }}
        >
          <Button variant="secondary">
            <RotateCcw className="w-4" />
            リセット
          </Button>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認</AlertDialogTitle>
          <AlertDialogDescription>
            本当にリセットしますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleNext}>リセット</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
