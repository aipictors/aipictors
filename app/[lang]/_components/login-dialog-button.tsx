"use client"

import { LoginDialogContent } from "@/app/[lang]/_components/login-dialog-content"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * ログイン
 * @param props
 * @returns
 */
export function LoginDialogButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{"ログイン"}</Button>
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
