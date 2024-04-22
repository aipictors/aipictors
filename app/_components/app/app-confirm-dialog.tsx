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
} from "@/_components/ui/alert-dialog"
import { Checkbox } from "@/_components/ui/checkbox"
import { useState } from "react"

type Props = {
  description: string
  title?: string
  nextLabel?: string
  cancelLabel?: string
  children: React.ReactNode
  cookieKey?: string
  onNext(): void
  onCancel(): void
}

/**
 * 確認ダイアログ
 * @param props
 * @returns
 */
export const AppConfirmDialog = (props: Props) => {
  const [isCheck, setIsCheck] = useState(false)

  if (props.cookieKey) {
    if (
      document.cookie
        .split("; ")
        .some((item) => item.startsWith(`${props.cookieKey}=`))
    ) {
      // cookieKey が存在する場合、props.onNext を実行
      return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div onClick={props.onNext}>{props.children}</div>
      )
    }
  }

  const onNext = () => {
    if (props.cookieKey) {
      if (
        document.cookie
          .split("; ")
          .some((item) => item.startsWith(`${props.cookieKey}=`))
      ) {
        // cookieKey が存在する場合、props.onNext を実行
        props.onNext()
        return
      }

      if (isCheck) {
        const expiryDate = new Date()

        expiryDate.setDate(expiryDate.getDate() + 7) // Cookieの有効期限を1週間後に設定
        document.cookie = `${
          props.cookieKey
        }=true; expires=${expiryDate.toUTCString()}; path=/`
      }

      props.onNext()
    } else {
      // cookieKey が存在しない場合、直接 props.onNext を実行
      props.onNext()
    }
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
            {props.cancelLabel ?? "いいえ"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onNext}>
            {props.nextLabel ?? "はい"}
          </AlertDialogAction>
        </AlertDialogFooter>
        {props.cookieKey && (
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(value: boolean) => {
                setIsCheck(value)
              }}
              id="hide-check"
              checked={isCheck}
            />
            <label htmlFor="hide-check" className="font-medium text-sm">
              今後表示しない
            </label>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
