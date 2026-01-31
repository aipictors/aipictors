import { Trash2Icon } from "lucide-react"
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
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onDelete: () => void
  title: string
  disabled: boolean
}

export function GenerationTaskDeleteConfirmDialog (props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = () => {
    props.onDelete()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          title={props.title}
          disabled={props.disabled}
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
        >
          <Trash2Icon className="w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirm")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("本当に削除しますか？", "Are you sure you want to delete this?")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {t("キャンセル", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleNext}>
            {t("削除", "Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
