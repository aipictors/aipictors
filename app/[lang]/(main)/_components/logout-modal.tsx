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

import { toast } from "sonner"

import { getAuth, signOut } from "firebase/auth"

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
}

export const LogoutModal = (props: Props) => {
  const handleLogout = async () => {
    await signOut(getAuth())
    props.onClose()
    toast("ログアウトしました。")
  }

  return (
    <AlertDialog open={props.isOpen} onOpenChange={props.onClose}>
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
          <AlertDialogCancel onClick={props.onClose}>
            {"やめとく"}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
