"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { resetCookieLoginToken } from "@/app/_utils/reset-cookie-login-token"
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
} from "@/components/ui/alert-dialog"
import { config } from "@/config"
import { getAuth, signOut } from "firebase/auth"
import { LogOutIcon } from "lucide-react"
import { toast } from "sonner"

/**
 * ログアウトする
 * @param props
 * @returns
 */
export function NavigationLogoutDialogButton() {
  const handleLogout = async () => {
    await signOut(getAuth())
    resetCookieLoginToken()
    toast("ログアウトしました。")
    const linkNode = document.createElement("a")
    linkNode.href = config.wordpressEndpoint.logout
    linkNode.click()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <HomeNavigationButton icon={LogOutIcon}>
          {"ログアウト"}
        </HomeNavigationButton>
      </AlertDialogTrigger>
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
