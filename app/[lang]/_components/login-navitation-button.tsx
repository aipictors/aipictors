"use client"

import { HomeNavigationButton } from "@/[lang]/(main)/_components/home-navigation-button"
import { LoginDialogContent } from "@/[lang]/_components/login-dialog-content"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import { LogInIcon } from "lucide-react"

/**
 * ログイン
 * @param props
 * @returns
 */
export function LoginNavigationButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <HomeNavigationButton icon={LogInIcon}>
          {"ログイン"}
        </HomeNavigationButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"ログイン"}</DialogTitle>
          <DialogDescription>
            {"ここから先はログインが必要みたい。"}
          </DialogDescription>
        </DialogHeader>
        <LoginDialogContent />
      </DialogContent>
    </Dialog>
  )
}
