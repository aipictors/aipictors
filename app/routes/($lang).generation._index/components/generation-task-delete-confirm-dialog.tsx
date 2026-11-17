import { XIcon } from "lucide-react"
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
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onDelete: () => void
}

export function GenerationTaskDeleteConfirmDialog(props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div
          onClick={() => setIsOpen(true)}
          onKeyUp={(e) => {
            if (e.key === "Enter") setIsOpen(true)
          }}
        >
          <XIcon color="black" className="fill-white" />
        </div>
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
          <AlertDialogAction
            onClick={() => {
              props.onDelete()
              setIsOpen(false)
            }}
          >
            {t("削除", "Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
