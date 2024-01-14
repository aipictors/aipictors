"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { captureException } from "@sentry/nextjs"
import { TwitterAuthProvider, getAuth, signInWithPopup } from "firebase/auth" // ここはXの認証プロバイダーに応じて変更します。

type Props = {
  onClose(): void
  disabled: boolean
}

export const LoginWithX = ({ onClose, disabled }: Props) => {
  const { toast } = useToast()

  const onLoginWithX = async () => {
    if (disabled) return; // ボタンが無効化されている場合は何もしない

    try {
      await signInWithPopup(getAuth(), new TwitterAuthProvider())
      onClose()
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast({ description: "アカウントが見つかりませんでした" })
      }
    }
  }

  return (
    <Button className="w-full" onClick={onLoginWithX} disabled={disabled}>
      {"Xでログイン"}
    </Button>
  )
}
