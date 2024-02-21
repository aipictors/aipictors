"use client"

import { SocialLoginButton } from "@/app/[lang]/_components/social-login-button"
import CloudflareTurnstile, {
  Status,
} from "@/app/[lang]/generation/_components/cloudflare-turnstile"
import { PasswordLoginForm } from "@/app/_components/password-login-form"
import type { FormLogin } from "@/app/_types/form-login"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { loginWithPasswordMutation } from "@/graphql/mutations/login-with-password"
import { useMutation } from "@apollo/client"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithCustomToken,
} from "firebase/auth"
import Link from "next/link"
import { useState } from "react"
import { RiGoogleFill, RiTwitterXFill } from "react-icons/ri"
import { toast } from "sonner"

type Props = {
  children: React.ReactNode
}

/**
 * ログイン
 * @param props
 * @returns
 */
export const LoginDialog = (props: Props) => {
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
      {props.children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"ログイン"}</DialogTitle>
          <DialogDescription>
            {"ここから先はログインが必要みたい。"}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-2">
          <p className="text-sm">{"SNSアカウントでログイン"}</p>
          <div className="flex flex-col md:flex-row gap-2">
            <SocialLoginButton
              disabled={isLoading || turnstileStatus !== "solved"} // CAPTCHAが解決されていない場合に無効化
              provider={new GoogleAuthProvider()}
              buttonText="Googleでログイン"
              icon={<RiGoogleFill className="mr-2 h-4 w-4" />}
            />
            <SocialLoginButton
              disabled={isLoading || turnstileStatus !== "solved"} // CAPTCHAが解決されていない場合に無効化
              provider={new TwitterAuthProvider()}
              buttonText="𝕏(Twitter)でログイン"
              icon={<RiTwitterXFill className="mr-2 h-4 w-4" />}
            />
          </div>
        </div>

        <Separator />

        <div className="w-full my-2 space-y-2">
          <p className="text-sm">{"またはアカウント情報でログイン"}</p>
          <PasswordLoginForm
            onSubmit={onLogin}
            isLoading={isLoading || turnstileStatus !== "solved"}
          />{" "}
          // CAPTCHAが解決されていない場合に無効化
        </div>

        <CloudflareTurnstile onStatusChange={setTurnstileStatus} />

        <Separator />

        <div className={"flex flex-col w-full gap-y-2"}>
          <span className="text-sm">
            {"アカウントをお持ちで無い方はこちら"}
          </span>
          <Link
            className="w-full"
            target="_blank"
            href={"https://www.aipictors.com/login/"}
          >
            <Button
              className="w-full"
              variant={"secondary"}
              disabled={isLoading}
            >
              {"アカウント作成"}
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
