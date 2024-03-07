"use client"

import { PasswordLoginForm } from "@/app/_components/password-login-form"
import { FormLogin } from "@/app/_types/form-login"
import { Card, CardContent } from "@/components/ui/card"
import { loginWithPasswordMutation } from "@/graphql/mutations/login-with-password"
import { signInWithToken } from "@/lib/auth/actions/sign-in-with-token"
import { useMutation } from "@apollo/client"
import { captureException } from "@sentry/nextjs"
import { getAuth, getIdToken, signInWithCustomToken } from "firebase/auth"
import { toast } from "sonner"

export function DebugLoginForm() {
  const [mutation, { loading: isLoading }] = useMutation(
    loginWithPasswordMutation,
  )

  const onLogin = async (form: FormLogin) => {
    try {
      if (getAuth().currentUser === null) {
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
      }
      const currentUser = getAuth().currentUser
      if (currentUser === null) {
        toast("ログインに失敗しました。")
        return
      }
      const idToken = await getIdToken(currentUser, true)
      await signInWithToken({
        idToken: idToken,
        refreshToken: currentUser.refreshToken,
      })
      toast("ログインしました。")
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <div className="pt-16">
      <Card className="max-w-80 mx-auto">
        <CardContent className="p-4 space-y-4">
          <div>{"ログイン"}</div>
          <PasswordLoginForm onSubmit={onLogin} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
