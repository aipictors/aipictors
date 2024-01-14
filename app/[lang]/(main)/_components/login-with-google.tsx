"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { captureException } from "@sentry/nextjs"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"

type Props = {
  onClose(): void
  disabled: boolean
}

export const LoginWithGoogle = ({ onClose, disabled }: Props) => {
  const { toast } = useToast()

  const onLoginWithGoogle = async () => {
    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider())
      onClose()
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast({ description: "アカウントが見つかりませんでした" })
      }
    }
  }

  return (
    <Button className="w-full" onClick={onLoginWithGoogle} disabled={disabled}>
      {"Googleでログイン"}
    </Button>
  )
}
