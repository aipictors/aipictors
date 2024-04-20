import { PasswordLoginForm } from "@/_components/password-login-form"
import { SocialLoginButton } from "@/_components/social-login-button"
import { Button } from "@/_components/ui/button"
import { Separator } from "@/_components/ui/separator"
import { loginWithPasswordMutation } from "@/_graphql/mutations/login-with-password"
import type { FormLogin } from "@/_types/form-login"
import { useMutation } from "@apollo/client/index.js"
import { Link } from "@remix-run/react"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithCustomToken,
} from "firebase/auth"
import { RiGoogleFill, RiTwitterXFill } from "react-icons/ri"
import { toast } from "sonner"

type Props = {
  children: React.ReactNode
}

/**
 * ログイン
 * @param props
 * @returns
 */
export const LoginDialog = (props: Props) => {
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
    <div>
      <div className="my-2 space-y-2">
        <p className="text-sm">{"SNSアカウントでログイン"}</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <SocialLoginButton
            disabled={isLoading}
            provider={new GoogleAuthProvider()}
            buttonText="Googleでログイン"
            icon={<RiGoogleFill className="mr-2 h-4 w-4" />}
          />
          <SocialLoginButton
            disabled={isLoading}
            provider={new TwitterAuthProvider()}
            buttonText="𝕏(Twitter)でログイン"
            icon={<RiTwitterXFill className="mr-2 h-4 w-4" />}
          />
        </div>
      </div>
      <Separator />
      <div className="my-2 w-full space-y-2">
        <p className="text-sm">{"またはアカウント情報でログイン"}</p>
        <PasswordLoginForm onSubmit={onLogin} isLoading={isLoading} />
      </div>
      <Separator />
      <div className={"flex w-full flex-col gap-y-2"}>
        <span className="text-sm">{"アカウントをお持ちで無い方はこちら"}</span>
        <Link
          className="w-full"
          target="_blank"
          to={"https://www.aipictors.com/login/"}
        >
          <Button className="w-full" variant={"secondary"} disabled={isLoading}>
            {"アカウント作成"}
          </Button>
        </Link>
      </div>
    </div>
  )
}
