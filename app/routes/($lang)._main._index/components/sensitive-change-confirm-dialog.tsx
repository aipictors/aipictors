"use client"

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
import { Checkbox } from "~/components/ui/checkbox"
import { useTranslation } from "~/hooks/use-translation"
import { Button } from "~/components/ui/button"
import { useNavigate } from "react-router";

export function SensitiveChangeConfirmDialog() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [isCheck, setIsCheck] = useState(false)
  const [shouldSkipDialog, setShouldSkipDialog] = useState(false)
  const cookieKey = "check-sensitive-ranking"

  useEffect(() => {
    const cookieExists = document.cookie
      .split("; ")
      .some((item) => item.startsWith(`${cookieKey}=`))
    setShouldSkipDialog(cookieExists)
  }, [])

  const onNext = () => {
    if (isCheck) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)
      document.cookie = `${cookieKey}=true; expires=${expiryDate.toUTCString()}; path=/`
    }
    navigate("/r")
  }

  if (shouldSkipDialog) {
    return (
      <div onClick={onNext} onKeyDown={(e) => e.key === "Enter" && onNext()}>
        <Button variant="secondary" className="flex w-full items-center">
          <p className="text-sm">{t("センシティブ", "Sensitive")}</p>
        </Button>
      </div>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" className="flex w-full items-center">
          <p className="text-sm">{t("センシティブ", "Sensitive")}</p>
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
          <AlertDialogCancel onClick={() => {}}>
            {t("いいえ", "No")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onNext}>
            {t("はい", "Yes")}
          </AlertDialogAction>
        </AlertDialogFooter>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hide-check"
            checked={isCheck}
            onCheckedChange={(checked: boolean) => setIsCheck(checked === true)}
          />
          <label
            htmlFor="hide-check"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("今後表示しない", "Do not show again")}
          </label>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
