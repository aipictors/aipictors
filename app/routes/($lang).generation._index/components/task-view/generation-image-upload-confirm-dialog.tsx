import { FileUp } from "lucide-react"
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
  onClick: () => void
  title: string
  disabled: boolean
}

export function GenerationImageUploadConfirmDialog(props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleNext = () => {
    props.onClick()
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
          className="w-12"
        >
          <div className="mx-2 flex items-center">
            <FileUp className="w-4" />
            {t("投稿", "Post")}
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("投稿する", "Post")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "投稿サイトAipictorsに作品を投稿しますか？",
              "Do you want to post this to Aipictors?",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {t("キャンセル", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleNext}>
            {t("投稿", "Post")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
