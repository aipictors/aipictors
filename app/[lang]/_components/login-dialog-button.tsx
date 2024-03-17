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
import { cn } from "@/lib/utils"

type Props = {
  label?: string
  isWidthFull?: boolean
  triggerChildren?: React.ReactNode
}

/**
 * ログイン
 * @param props
 * @returns
 */
export function LoginDialogButton(props: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {props.triggerChildren ? (
          props.triggerChildren
        ) : (
          <Button className={cn(props.isWidthFull ? "w-full" : "")}>
            {props.label ? props.label : "ログイン"}
          </Button>
        )}
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
