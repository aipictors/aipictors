import { useState } from "react"
import { toast } from "sonner"
import { SelectableCardButton } from "~/components/selectable-card-button"
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
  onRestore: () => void
  largeThumbnailImageUrl: string
  title: string
}

export function GenerationUpdateSettingConfirmDialog (props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = () => {
    props.onRestore()
    toast("設定を復元しました")
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <SelectableCardButton
          onClick={() => setIsOpen(true)}
          isSelected={false}
          isDisabled={true}
        >
          <img src={props.largeThumbnailImageUrl} alt="Thumbnail" />
        </SelectableCardButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>
            選択した作品で復元しますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleNext}>復元</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
