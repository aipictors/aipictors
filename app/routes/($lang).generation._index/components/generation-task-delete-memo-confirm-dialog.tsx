import { Trash2 } from "lucide-react"
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
import { GenerationMenuButton } from "~/routes/($lang).generation._index/components/generation-menu-button"

type Props = {
  onDelete: () => void
  isDeletedLoading: boolean
}

export function GenerationTaskDeleteMemoConfirmDialog (props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = () => {
    props.onDelete()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <GenerationMenuButton
          title={t("生成履歴を削除する", "Delete generation history")}
          onClick={() => setIsOpen(true)}
          icon={Trash2}
          isLoading={props.isDeletedLoading}
          disabled={props.isDeletedLoading}
        />
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
