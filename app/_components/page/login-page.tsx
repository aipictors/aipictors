"use client"

import { AppCanvas } from "@/app/[lang]/app/_components/app-canvas"
import { PasswordLoginForm } from "@/app/_components/password-login-form"
import type { FormLogin } from "@/app/_types/form-login"
import { AppPageCenter } from "@/components/app/app-page-center"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { loginWithPasswordMutation } from "@/graphql/mutations/login-with-password"
import { useMutation } from "@apollo/client"
import { captureException } from "@sentry/nextjs"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
} from "firebase/auth"
import Link from "next/link"
import { toast } from "sonner"

/**
 * ログインページ
 * @returns
 */
export const LoginPage = () => {
  const [mutation, { loading: isLoading }] = useMutation(
    loginWithPasswordMutation,
  )

  const onLogin = async (form: FormLogin) => {
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
      captureException(error)
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onLoginWithGoogle = async () => {
    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider())
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  const onLoginWithTwitter = async () => {
    try {
      await signInWithPopup(getAuth(), new TwitterAuthProvider())
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  return (
    <AppPageCenter className="h-full w-full p-4 pb-4 md:max-w-screen-lg md:pt-16">
      <div className="flex w-full flex-col items-center justify-center pt-4 lg:h-full lg:flex-row lg:items-start md:pt-0">
        <div className="flex h-full w-full flex-1 flex-col items-center">
          <div className="w-full space-y-4 lg:w-80">
            <h1 className="w-full text-lg">
              {"ここから先はログインが必要です"}
            </h1>
            <Button className="w-full" onClick={onLoginWithGoogle}>
              {"Googleでログイン"}
            </Button>
            <Button className="w-full" onClick={onLoginWithTwitter}>
              {"Xでログイン"}
            </Button>
            <Separator />
            <div className="w-full space-y-2">
              <p className="text-sm">{"またはパスワードでログイン"}</p>
              <PasswordLoginForm onSubmit={onLogin} isLoading={isLoading} />
            </div>
            <Separator />
            <div className={"flex w-full flex-col gap-y-2"}>
              <p className="text-sm">{"アカウントをお持ちで無い方はこちら"}</p>
              <Link
                className="w-full"
                target="_blank"
                href={"https://www.aipictors.com/login/"}
              >
                <Button className="w-full" variant={"secondary"}>
                  {"アカウント作成"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden h-full w-full flex-1 lg:block">
          <Card className="h-full w-full bg-zinc-200 p-4 dark:bg-zinc-500">
            <p className="text-sm">{"aipictors.com"}</p>
            <AppCanvas />
          </Card>
        </div>
      </div>
    </AppPageCenter>
  )
}
