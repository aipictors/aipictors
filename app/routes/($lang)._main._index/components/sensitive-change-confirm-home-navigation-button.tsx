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
import { useNavigate } from "react-router";
import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import { BoxIcon } from "lucide-react"

export function SensitiveChangeConfirmHomeNavigationButton() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [isCheck, setIsCheck] = useState(false)
  const [shouldSkipDialog, setShouldSkipDialog] = useState(false)
  const cookieKey = "check-sensitive"

  const closeHeaderMenu = () => {
    // ここでヘッダーメニューを閉じる処理を追加
  }

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
    closeHeaderMenu()
  }

  if (shouldSkipDialog) {
    return (
      <div onClick={onNext} onKeyUp={(e) => e.key === "Enter" && onNext()}>
        <HomeNavigationButton icon={BoxIcon}>
          {t("センシティブ", "Sensitive")}
        </HomeNavigationButton>
      </div>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <HomeNavigationButton icon={BoxIcon}>
          {t("センシティブ", "Sensitive")}
        </HomeNavigationButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirmation")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "センシティブ版のトップページに遷移します。あなたは18歳以上ですか？",
              "You are about to navigate to the sensitive content homepage. Are you 18 years or older?",
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
