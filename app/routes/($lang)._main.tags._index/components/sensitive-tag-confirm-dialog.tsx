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
import { useNavigate } from "react-router";
import { RefreshCcwIcon } from "lucide-react"

type Props = {
  tag: string
}

export function SensitiveTagConfirmDialog(props: Props) {
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
    navigate(`/r/tags/${props.tag}`)
    setIsOpen(false)
  }

  if (shouldSkipDialog) {
    return (
      <Button
        variant="secondary"
        className="flex w-full transform cursor-pointer items-center"
        onClick={handleNext}
      >
        <RefreshCcwIcon className="mr-1 w-3" />
        <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
      </Button>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex w-full transform cursor-pointer items-center"
          onClick={() => setIsOpen(true)}
        >
          <RefreshCcwIcon className="mr-1 w-3" />
          <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirmation")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "センシティブな作品を表示します、あなたは18歳以上ですか？",
              "Sensitive content will be displayed. Are you 18 or older?",
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
