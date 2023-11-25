"use client"

import { useLoginWithPasswordMutation } from "@/__generated__/apollo"
import { AppCanvas } from "@/app/[lang]/app/_components/app-canvas"
import { LoginForm } from "@/app/_components/login-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { FormLogin } from "@/app/_types/form-login"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { captureException } from "@sentry/nextjs"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
} from "firebase/auth"
import Link from "next/link"

/**
 * ログインページ
 * @returns
 */
export const LoginPage = () => {
  const [mutation, { loading: isLoading }] = useLoginWithPasswordMutation()

  const { toast } = useToast()

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
        toast({ description: "ログインに失敗しました。" })
        return
      }
      await signInWithCustomToken(getAuth(), token)
      toast({ description: "ログインしました。" })
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast({ description: error.message })
      }
    }
  }

  const onLoginWithGoogle = async () => {
    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider())
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast({ description: "アカウントが見つかりませんでした" })
      }
    }
  }

  const onLoginWithTwitter = async () => {
    try {
      await signInWithPopup(getAuth(), new TwitterAuthProvider())
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast({ description: "アカウントが見つかりませんでした" })
      }
    }
  }

  return (
    <MainCenterPage className="sm:max-w-sm lg:max-w-none w-full px-4 pb-4">
      <div className="w-full flex flex-col pt-4 md:pt-0 lg:h-full justify-center items-center lg:flex-row lg:items-start">
        <div className="flex-1 w-full flex flex-col items-center h-full ">
          <div className="w-full lg:w-80 space-y-4">
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
              <LoginForm onSubmit={onLogin} isLoading={isLoading} />
            </div>
            <Separator />
            <div className={"flex flex-col w-full gap-y-2"}>
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
        <div className="flex-1 w-full h-full hidden lg:block">
          <Card className="p-4 w-full h-full bg-zinc-200 dark:bg-zinc-500">
            <p className="text-sm">{"aipictors.com"}</p>
            <AppCanvas />
          </Card>
        </div>
      </div>
    </MainCenterPage>
  )
}
