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
  DialogDescription,
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
import { useContext } from "react"
import { RiGoogleFill, RiTwitterXFill } from "react-icons/ri"
import { toast } from "sonner"

export const LoginModal = () => {
  const authContext = useContext(AuthContext)

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
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback />
        </Avatar>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"ログイン"}</DialogTitle>
          <DialogDescription>ログインする</DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-2">
          <p className="text-sm">{"SNSアカウントでログイン"}</p>
          <div className="flex flex-row justify-center">
            <LoginWithProvider
              disabled={isLoading}
              provider={new GoogleAuthProvider()}
              buttonText="Googleでログイン"
              icon={<RiGoogleFill className="mr-2 h-4 w-4" />}
            />

            <LoginWithProvider
              disabled={isLoading}
              provider={new TwitterAuthProvider()}
              buttonText="𝕏(Twitter)でログイン"
              icon={<RiTwitterXFill className="mr-2 h-4 w-4" />}
            />
          </div>
        </div>

        <Separator />

        <div className="w-full my-2 space-y-2">
          <p className="text-sm">{"またはアカウント情報でログイン"}</p>
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
