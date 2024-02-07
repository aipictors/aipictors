"use client"

import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import { captureException } from "@sentry/nextjs"
import { AuthProvider, getAuth, signInWithPopup } from "firebase/auth"
import { toast } from "sonner"

type Props = {
  disabled: boolean
  provider: AuthProvider
  buttonText: string
}

export const LoginWithProvider = ({
  disabled,
  provider,
  buttonText,
}: Props) => {
  const onLogin = async () => {
    if (disabled) return

    try {
      await signInWithPopup(getAuth(), provider)
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  return (
    <Button className="w-full" onClick={onLogin} disabled={disabled}>
      {disabled && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  )
}
