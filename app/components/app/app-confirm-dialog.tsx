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

type Props = Readonly<{
  description: string
  title?: string
  nextLabel?: string
  cancelLabel?: string
  children: React.ReactNode
  cookieKey?: string
  onNext(): void
  onCancel(): void
}>

export function AppConfirmDialog(props: Props) {
  const t = useTranslation()
  const [isCheck, setIsCheck] = useState(false)
  const [shouldSkipDialog, setShouldSkipDialog] = useState(false)

  useEffect(() => {
    if (props.cookieKey) {
      const cookieExists = document.cookie
        .split("; ")
        .some((item) => item.startsWith(`${props.cookieKey}=`))
      setShouldSkipDialog(cookieExists)
    }
  }, [props.cookieKey])

  const onNext = () => {
    if (props.cookieKey && isCheck) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)
      document.cookie = `${props.cookieKey}=true; expires=${expiryDate.toUTCString()}; path=/`
    }
    props.onNext()
  }

  if (shouldSkipDialog) {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <div onClick={props.onNext}>{props.children}</div>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title ?? ""}</AlertDialogTitle>
          <AlertDialogDescription>{props.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props.onCancel}>
            {props.cancelLabel ?? t("いいえ", "No")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onNext}>
            {props.nextLabel ?? t("はい", "Yes")}
          </AlertDialogAction>
        </AlertDialogFooter>
        {props.cookieKey && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hide-check"
              checked={isCheck}
              onCheckedChange={(checked: boolean) =>
                setIsCheck(checked === true)
              }
            />
            <label
              htmlFor="hide-check"
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("今後表示しない", "Do not show again")}
            </label>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
