import { FileUp } from "lucide-react"
import { useEffect, useState } from "react"
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
import { GenerationMenuButton } from "~/routes/($lang).generation.demonstration/components/generation-menu-button"

type Props = {
  onPost: () => void
}

export function GenerationTaskPostConfirmDialog(props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const cookieKey = "generation_post"

  useEffect(() => {
    const cookieExists = document.cookie
      .split("; ")
      .some((item) => item.startsWith(`${cookieKey}=`))
    if (cookieExists) {
      setIsOpen(false)
    }
  }, [])

  const handleNext = () => {
    props.onPost()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <GenerationMenuButton
          title={t("投稿する", "Post")}
          onClick={() => setIsOpen(true)}
          text={t("投稿", "Post")}
          icon={FileUp}
        />
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
