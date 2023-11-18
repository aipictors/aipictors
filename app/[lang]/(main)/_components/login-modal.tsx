"use client"

import { useLoginWithPasswordMutation } from "@/__generated__/apollo"
import { LoginModalForm } from "@/app/[lang]/(main)/_components/login-modal-form"
import type { FormLogin } from "@/app/_types/form-login"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getAuth, signInWithCustomToken } from "firebase/auth"

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
    <Dialog
      open={props.isOpen}
      onOpenChange={() => {
        props.onClose()
      }}
    >
      <DialogContent>
        <LoginModalForm
          onSubmit={onLogin}
          isLoading={isLoading}
          onClose={props.onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
