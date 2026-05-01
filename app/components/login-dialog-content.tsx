import { PasswordLoginForm } from "~/components/password-login-form"
import { SocialLoginButton } from "~/components/social-login-button"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import type { FormLogin } from "~/types/form-login"
import { gql, useMutation } from "@apollo/client/index"
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth,
  signInWithCustomToken,
} from "firebase/auth"
import { RiGoogleFill, RiTwitterXFill } from "@remixicon/react"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { Suspense, useState } from "react"
import { LineLoggedInWithUrlButton } from "~/components/line-logged-in-with-url-button"
import { LineLoggedInButton } from "~/components/button/line-logged-in-button"
import { useTranslation } from "~/hooks/use-translation"

/**
 * ログイン
 */
export function LoginDialogContent (): React.ReactNode {
  const t = useTranslation()
  const [email, setEmail] = useState("")

  const [mutation, { loading: isLoading }] = useMutation(
    loginWithPasswordMutation,
  )
  const [sendEmailAuthLinkMutation, { loading: isSendingEmailLink }] =
    useMutation(sendEmailAuthLinkMutationDocument)

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

  const onSendEmailLink = async () => {
    try {
      const normalizedEmail = email.trim()

      if (!normalizedEmail) {
        toast(t("メールアドレスを入力してください", "Enter your email address"))
        return
      }

      await sendEmailAuthLinkMutation({
        variables: {
          input: {
            email: normalizedEmail,
          },
        },
      })

      toast(
        t(
          "確認メールを送信しました。メール内のリンクからログインしてください。",
          "Verification email sent. Use the link in the email to sign in.",
        ),
      )
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
            "メールアドレスでログインまたは新規登録",
            "Log in or sign up with email",
          )}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("メールアドレス", "Email address")}
            disabled={isLoading || isSendingEmailLink}
          />
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            onClick={onSendEmailLink}
            disabled={isLoading || isSendingEmailLink}
          >
            {t("確認メールを送る", "Send verification email")}
          </button>
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

const sendEmailAuthLinkMutationDocument = gql`
  mutation SendEmailAuthLink($input: SendEmailAuthLinkInput!) {
    sendEmailAuthLink(input: $input)
  }
`
