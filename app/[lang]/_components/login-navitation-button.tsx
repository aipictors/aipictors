"use client"

import { HomeNavigationButton } from "@/app/[lang]/(main)/_components/home-navigation-button"
import { LoginDialogContent } from "@/app/[lang]/_components/login-dialog-content"
import { Status } from "@/app/[lang]/generation/_components/cloudflare-turnstile"
import type { FormLogin } from "@/app/_types/form-login"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { loginWithPasswordMutation } from "@/graphql/mutations/login-with-password"
import { useMutation } from "@apollo/client"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { LogInIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * ログイン
 * @param props
 * @returns
 */
export function LoginNavigationButton() {
  const [mutation, { loading: isLoading }] = useMutation(
    loginWithPasswordMutation,
  )
  const [turnstileStatus, setTurnstileStatus] = useState<Status | null>(null) // Add this line to manage Turnstile status

  const onLogin = async (form: FormLogin) => {
    if (turnstileStatus !== "solved") {
      toast("CAPTCHAを解決してください。")
      return
    }

    try {
      const result = await mutation({
        variables: {
          input: {
            login: form.login,
            password: form.password,
          },
        },
      })
      const token = result.data?.loginWithPassword.token ?? null
      if (token === null) {
        toast("ログインに失敗しました。")
        return
      }
      await signInWithCustomToken(getAuth(), token)
      toast("ログインしました。")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

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
