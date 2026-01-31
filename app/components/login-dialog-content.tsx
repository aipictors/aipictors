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
import { useTranslation } from "~/hooks/use-translation"

/**
 * ログイン
 */
export function LoginDialogContent (): React.ReactNode {
  const t = useTranslation()

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
        toast(t("ログインに失敗しました。", "Login failed."))
        return
      }
      await signInWithCustomToken(getAuth(), token)
      toast(t("ログインしました。", "Login successful."))
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <>
      <div className="my-2 space-y-2">
        <p className="text-sm">
          {t("SNSアカウントでログイン", "Login with social accounts")}
        </p>
        <p className="text-sm">
          {t(
            "ここからアカウントを「作成」した場合は旧版にはパスワード認証のみ可能です",
            "If you create an account from here, only password authentication is available in the old version.",
          )}
        </p>
        <div className="flex flex-col gap-2">
          <SocialLoginButton
            disabled={isLoading}
            provider={new GoogleAuthProvider()}
            buttonText={t("Googleで続ける", "Continue with Google")}
            icon={<RiGoogleFill className="mr-2 size-4" />}
          />
          <SocialLoginButton
            disabled={isLoading}
            provider={new TwitterAuthProvider()}
            buttonText={t("𝕏(Twitter)で続ける", "Continue with X (Twitter)")}
            icon={<RiTwitterXFill className="mr-2 size-4" />}
          />
          <Suspense
            fallback={<LineLoggedInButton disabled={true} onClick={() => {}} />}
          >
            <LineLoggedInWithUrlButton
              text={t("LINEで続ける", "Continue with LINE")}
            />
          </Suspense>
        </div>
      </div>
      <Separator />
      <div className="my-2 w-full space-y-2">
        <p className="text-sm">
          {t(
            "またはアカウント情報でログイン",
            "Or log in with your account information",
          )}
        </p>
        <PasswordLoginForm onSubmit={onLogin} isLoading={isLoading} />
      </div>
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
