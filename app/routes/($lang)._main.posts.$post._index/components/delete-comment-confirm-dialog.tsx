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
  onDeleteComment: () => void
}

/**
 * コメント削除の確認ダイアログ
 */
export function DeleteCommentConfirmDialog (props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <p
          className="cursor-pointer text-xs"
          onClick={() => setIsOpen(true)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsOpen(true)
            }
          }}
        >
          {t("削除", "Delete")}
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirm")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "コメントを削除しますか？",
              "Do you want to delete this comment?",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {t("キャンセル", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              props.onDeleteComment()
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
