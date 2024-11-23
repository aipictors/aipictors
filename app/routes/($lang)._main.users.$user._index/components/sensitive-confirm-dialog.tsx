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
import { Heart, RefreshCcwIcon } from "lucide-react"

type Props = {
  userLogin: string
  receivedSensitiveLikesCount: number
}

export function SensitiveConfirmDialog(props: Props) {
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
    navigate(`/r/users/${props.userLogin}`)
    setIsOpen(false)
  }

  if (shouldSkipDialog) {
    return (
      <Button variant="secondary" onClick={handleNext}>
        <div className="flex cursor-pointer items-center">
          <RefreshCcwIcon className="mr-1 w-3" />
          <p className="text-sm">{t("対象年齢", "Target Age")}</p>
        </div>
      </Button>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          <div className="flex cursor-pointer items-center space-x-2 text-sm">
            <Heart className="mr-2 h-5 w-4" />
            {props.receivedSensitiveLikesCount}
            <p>{t("センシティブ", "Sensitive")}</p>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirmation")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "センシティブな作品を表示します、あなたは18歳以上ですか？",
              "Do you want to display sensitive content? Are you over 18 years old?",
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
