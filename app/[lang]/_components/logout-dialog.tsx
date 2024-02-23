"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAuth, signOut } from "firebase/auth"
import { toast } from "sonner"

type Props = {
  // biome-ignore lint/suspicious/noExplicitAny: TODO: Triggerを修正する
  children: any // React.ReactNode
}

/**
 * ダイアログをトリガーする
 * ログアウトする
 * @param props
 * @returns
 */
export function LogoutDialog(props: Props) {
  const handleLogout = async () => {
    await signOut(getAuth())
    toast("ログアウトしました。")
  }

  return (
    <AlertDialog>
      {props.children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{"本当にログアウトしますか？"}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {
            "ログアウトすると、再度ログインするまでアップロードやコメントができなくなります。"
          }
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleLogout}>{"はい"}</AlertDialogAction>
          <AlertDialogCancel>{"やめとく"}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
