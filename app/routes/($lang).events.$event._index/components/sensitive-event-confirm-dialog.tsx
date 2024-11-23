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
import { useNavigate } from "react-router";
import { RefreshCcwIcon } from "lucide-react"

type Props = {
  slug: string
}

export function SensitiveEventConfirmDialog(props: Props) {
  const { slug } = props
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
    navigate(`/r/events/${slug}`)
    setIsOpen(false)
  }

  if (shouldSkipDialog) {
    return (
      <div
        className="mt-4 flex w-40 cursor-pointer justify-center"
        onClick={handleNext}
        onKeyUp={(e) => e.key === "Enter" && handleNext()}
      >
        <RefreshCcwIcon className="mr-1 w-3" />
        <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
      </div>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div
          className="mt-4 flex w-40 cursor-pointer justify-center"
          onClick={() => setIsOpen(true)}
          onKeyUp={(e) => e.key === "Enter" && setIsOpen(true)}
        >
          <RefreshCcwIcon className="mr-1 w-3" />
          <p className="text-sm">{t("対象年齢", "Age Restriction")}</p>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirmation")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "センシティブ版を表示します。あなたは18歳以上ですか？",
              "Displaying sensitive content. Are you over 18?",
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
