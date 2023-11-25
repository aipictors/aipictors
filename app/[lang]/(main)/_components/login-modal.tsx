"use client"

import { useLoginWithPasswordMutation } from "@/__generated__/apollo"

import { LoginForm } from "@/app/_components/login-form"
import type { FormLogin } from "@/app/_types/form-login"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

type Props = {
  isOpen: boolean
  onClose(): void
}

export const LoginModal = (props: Props) => {
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
      props.onClose()
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message })
      }
    }
  }

  const onLoginWithGoogle = async () => {
    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider())
      props.onClose()
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
      props.onClose()
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast({ description: "アカウントが見つかりませんでした" })
      }
    }
  }

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={() => {
        props.onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"ログイン"}</DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
