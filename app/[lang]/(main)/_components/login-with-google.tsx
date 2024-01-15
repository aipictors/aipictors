"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ReloadIcon } from "@radix-ui/react-icons"
import { captureException } from "@sentry/nextjs"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"

type Props = {
  onClose(): void
  disabled: boolean
}

export const LoginWithGoogle = ({ onClose, disabled }: Props) => {
  const onLoginWithGoogle = async () => {
    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider())
      onClose()
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  return (
    <Button className="w-full" onClick={onLoginWithGoogle} disabled={disabled}>
      {disabled && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
      {"Googleでログイン"}
    </Button>
  )
}
