"use client"

import { Button } from "@/components/ui/button"
import { captureException } from "@sentry/nextjs"
import { TwitterAuthProvider, getAuth, signInWithPopup } from "firebase/auth" // ここはXの認証プロバイダーに応じて変更します。
import { toast } from "sonner"

type Props = {
  onClose(): void
  disabled: boolean
}

export const LoginWithX = ({ onClose, disabled }: Props) => {
  const onLoginWithX = async () => {
    if (disabled) return // ボタンが無効化されている場合は何もしない

    try {
      await signInWithPopup(getAuth(), new TwitterAuthProvider())
      onClose()
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  return (
    <Button className="w-full" onClick={onLoginWithX} disabled={disabled}>
      {"Xでログイン"}
    </Button>
  )
}
