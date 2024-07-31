import { PasswordLoginForm } from "~/components/password-login-form"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import type { FormLogin } from "~/types/form-login"
import { AppCanvas } from "~/routes/($lang).app._index/components/app-canvas"
import { useMutation } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
} from "firebase/auth"
import { graphql } from "gql.tada"
import { toast } from "sonner"

/**
 * ログインページ
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
      // captureException(error)
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onLoginWithGoogle = async () => {
    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider())
    } catch (error) {
      // captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  const onLoginWithTwitter = async () => {
    try {
      await signInWithPopup(getAuth(), new TwitterAuthProvider())
    } catch (error) {
      // captureException(error)
      if (error instanceof Error) {
        toast("アカウントが見つかりませんでした")
      }
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-center pt-4 md:pt-0 lg:h-full lg:flex-row lg:items-start">
      <div className="flex h-full w-full flex-1 flex-col items-center">
        <div className="w-full space-y-4 lg:w-80">
          <h1 className="w-full text-lg">{"ここから先はログインが必要です"}</h1>
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
              to={"https://www.aipictors.com/login/"}
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
  )
}

const loginWithPasswordMutation = graphql(
  `mutation LoginWithPassword($input: LoginWithPasswordInput!) {
    loginWithPassword(input: $input) {
      token
    }
  }`,
)
