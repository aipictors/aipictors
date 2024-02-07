"use client"

import { LoginWithProvider } from "@/app/[lang]/(main)/_components/login-with-provider"
import { LoginForm } from "@/app/_components/login-form"
import { AuthContext } from "@/app/_contexts/auth-context"
import type { FormLogin } from "@/app/_types/form-login"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"

export const LoginModal = () => {
  const [dialogOpen, setDialogOpen] = useState(true)
  const authContext = useContext(AuthContext)

  const [mutation, { loading: isLoading }] = useMutation(
    loginWithPasswordMutation,
  )

  useEffect(() => {
    // isLoggedInがtrueの場合、ダイアログを閉じる
    if (authContext.isLoggedIn) {
      setDialogOpen(false)
    }
  }, [authContext.isLoggedIn])

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
      setDialogOpen(false)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Avatar>
          <AvatarFallback />
        </Avatar>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"ログイン"}</DialogTitle>
        </DialogHeader>

        <LoginWithProvider
          disabled={isLoading}
          provider={new GoogleAuthProvider()}
          buttonText="Googleでログイン"
        />
        <LoginWithProvider
          disabled={isLoading}
          provider={new TwitterAuthProvider()}
          buttonText="Twitterでログイン"
        />

        <Separator />

        <div className="w-full space-y-2">
          <p className="text-sm">{"またはパスワードでログイン"}</p>
          <LoginForm onSubmit={onLogin} isLoading={isLoading} />
        </div>

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
            {/* ここでも isLoading がtrueのときdisabled */}
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
