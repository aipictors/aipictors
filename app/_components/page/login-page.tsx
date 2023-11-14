"use client"

import { useLoginWithPasswordMutation } from "@/__generated__/apollo"
import { LoginForm } from "@/app/_components/login-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { FormLogin } from "@/app/_types/form-login"
import { useToast } from "@/components/ui/use-toast"
import { getAuth, signInWithCustomToken } from "firebase/auth"

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
      if (error instanceof Error) {
        toast({ description: error.message })
      }
    }
  }

  return (
    <MainCenterPage>
      <div className="w-full flex flex-col justify-center items-center max-w-sm space-y-6 pb-16">
        <div className="flex justify-center">
          <img alt="Logo" src="/icon.png" className="w-32" />
        </div>
        <LoginForm onSubmit={onLogin} isLoading={isLoading} />
        <hr className="border-t" />
        <p className="text-sm">
          現在、アプリでのログインはパスワード認証のみに対応しています。パスワードはサイトから設定または変更できます。
        </p>
      </div>
    </MainCenterPage>
  )
}
