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
import { Button } from "~/components/ui/button"
import { useNavigate } from "react-router-dom"
import { RefreshCcwIcon } from "lucide-react"

export function RankingHeaderSensitiveConfirmDialog() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [shouldSkipDialog, setShouldSkipDialog] = useState(false)
  const cookieKey = "check-sensitive-ranking"

  useEffect(() => {
    const cookieExists = document.cookie
      .split("; ")
      .some((item) => item.startsWith(`${cookieKey}=`))
    setShouldSkipDialog(cookieExists)
  }, [cookieKey])

  const handleNext = () => {
    navigate("/r/rankings")
    setIsOpen(false)
  }

  if (shouldSkipDialog) {
    return (
      <Button className="w-full" variant="secondary" onClick={handleNext}>
        <RefreshCcwIcon className="mr-2 w-4" />
        {t("対象年齢", "Age Restricted")}
      </Button>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => setIsOpen(true)}
        >
          <RefreshCcwIcon className="mr-2 w-4" />
          {t("対象年齢", "Age Restricted")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirmation")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "センシティブな作品を表示します、あなたは18歳以上ですか？",
              "This content contains sensitive material. Are you over 18?",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {t("キャンセル", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleNext}>
            {t("確認", "Confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
