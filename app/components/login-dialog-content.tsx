import { PasswordLoginForm } from "~/components/password-login-form"
import { SocialLoginButton } from "~/components/social-login-button"
import { Separator } from "~/components/ui/separator"
import type { FormLogin } from "~/types/form-login"
import { useMutation } from "@apollo/client/index"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithCustomToken,
} from "firebase/auth"
import { RiGoogleFill, RiTwitterXFill } from "@remixicon/react"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { Suspense } from "react"
import { LineLoggedInWithUrlButton } from "~/components/line-logged-in-with-url-button"
import { LineLoggedInButton } from "~/components/button/line-logged-in-button"

/**
 * ログイン
 */
export function LoginDialogContent() {
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
    <>
      <div className="my-2 space-y-2">
        <p className="text-sm">{"SNSアカウントでログイン"}</p>
        <p className="text-sm">
          {
            "ここからアカウントを「作成」した場合は旧版にはパスワード認証のみ可能です"
          }
        </p>
        <div className="flex flex-col gap-2">
          <SocialLoginButton
            disabled={
              isLoading
              // || turnstileStatus !== "solved"
            }
            provider={new GoogleAuthProvider()}
            buttonText="Googleで続ける"
            icon={<RiGoogleFill className="mr-2 h-4 w-4" />}
          />
          <SocialLoginButton
            disabled={
              isLoading
              // || turnstileStatus !== "solved"
            }
            provider={new TwitterAuthProvider()}
            buttonText="𝕏(Twitter)で続ける"
            icon={<RiTwitterXFill className="mr-2 h-4 w-4" />}
          />
          <Suspense
            fallback={<LineLoggedInButton disabled={true} onClick={() => {}} />}
          >
            <LineLoggedInWithUrlButton text={"LINEで続ける"} />
          </Suspense>
        </div>
      </div>
      <Separator />
      <div className="my-2 w-full space-y-2">
        <p className="text-sm">{"またはアカウント情報でログイン"}</p>
        <PasswordLoginForm onSubmit={onLogin} isLoading={isLoading} />
      </div>
      {/* <Separator />
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
      <Separator />
      <div className={"flex w-full flex-col gap-y-2"}>
        <ToggleContent
          trigger={
            <span className="text-sm">
              {"ログインしているけどログイン状態にならない"}
            </span>
          }
        >
          <div className="mt-2 w-full">
            <NavigationLogoutDialogButton text="ログアウトを試す" />
          </div>
        </ToggleContent>
      </div> */}
    </>
  )
}

const loginWithPasswordMutation = graphql(
  `mutation LoginWithPassword($input: LoginWithPasswordInput!) {
    loginWithPassword(input: $input) {
      token
    }
  }`,
)
