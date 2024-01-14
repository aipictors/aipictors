"use client"

import { useLoginWithPasswordMutation } from "@/__generated__/apollo"
import { LoginWithGoogle } from "@/app/[lang]/(main)/_components/login-with-google"
import { LoginWithX } from "@/app/[lang]/(main)/_components/login-with-x"

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
import { getAuth, signInWithCustomToken } from "firebase/auth"
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

  return (
    <Dialog open={props.isOpen} onOpenChange={() => props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"ログイン"}</DialogTitle>
        </DialogHeader>

        <LoginWithGoogle onClose={props.onClose} disabled={isLoading} />
        <LoginWithX onClose={props.onClose} disabled={isLoading} />

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
            {/* ここでも isLoading がtrueのときdisabled */}
            <Button className="w-full" variant={"secondary"} disabled={isLoading}>
              {"アカウント作成"}
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
