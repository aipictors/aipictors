import { gql, useMutation } from "@apollo/client/index"
import { RiGoogleFill, RiTwitterXFill } from "@remixicon/react"
import { Link } from "@remix-run/react"
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCustomToken,
  TwitterAuthProvider,
} from "firebase/auth"
import { graphql } from "gql.tada"
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  Loader2Icon,
  MailCheckIcon,
} from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { toast } from "sonner"
import { LineLoggedInButton } from "~/components/button/line-logged-in-button"
import { LineLoggedInWithUrlButton } from "~/components/line-logged-in-with-url-button"
import { PasswordLoginForm } from "~/components/password-login-form"
import { SocialLoginButton } from "~/components/social-login-button"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { FormLogin } from "~/types/form-login"
import {
  isInAppBrowser,
  type LoginMethod,
  readLastLoginMethod,
  writeLastLoginMethod,
} from "~/utils/login-flow"

/** 確認メールをもう一度送れるようになるまでの秒数 */
const RESEND_SECONDS = 60

function LastUsedBadge() {
  const t = useTranslation()
  return (
    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 font-medium text-[10px] text-sky-700 dark:text-sky-300">
      {t("前回", "Last used")}
    </span>
  )
}

/**
 * ログインと新規登録（どちらも同じ入口。はじめての方はそのまま登録になる）
 */
export function LoginDialogContent(): React.ReactNode {
  const t = useTranslation()
  const [email, setEmail] = useState("")
  const [sentEmail, setSentEmail] = useState<string | null>(null)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInApp, setIsInApp] = useState(false)
  const [lastMethod, setLastMethod] = useState<LoginMethod | null>(null)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isUrlCopied, setIsUrlCopied] = useState(false)

  const [mutation, { loading: isLoading }] = useMutation(
    loginWithPasswordMutation,
  )
  const [sendEmailAuthLinkMutation, { loading: isSendingEmailLink }] =
    useMutation(sendEmailAuthLinkMutationDocument)

  // ブラウザでしか分からないものは表示のあとで読む（サーバーの HTML とずらさない）
  useEffect(() => {
    setIsInApp(isInAppBrowser(navigator.userAgent))
    const last = readLastLoginMethod()
    setLastMethod(last)
    if (last === "password") setIsPasswordOpen(true)
  }, [])

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendSeconds])

  const onLogin = async (form: FormLogin) => {
    setErrorMessage(null)
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
        setErrorMessage(t("ログインに失敗しました。", "Login failed."))
        return
      }
      await signInWithCustomToken(getAuth(), token)
      writeLastLoginMethod("password")
      toast(t("ログインしました。", "Login successful."))
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("ログインに失敗しました。", "Login failed."),
      )
    }
  }

  const onSendEmailLink = async () => {
    const normalizedEmail = email.trim()
    setErrorMessage(null)

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setErrorMessage(
        t(
          "メールアドレスを正しく入力してください。",
          "Enter a valid email address.",
        ),
      )
      return
    }

    try {
      await sendEmailAuthLinkMutation({
        variables: {
          input: {
            email: normalizedEmail,
          },
        },
      })
      writeLastLoginMethod("email")
      setSentEmail(normalizedEmail)
      setResendSeconds(RESEND_SECONDS)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("メールを送れませんでした。", "Could not send the email."),
      )
    }
  }

  const onCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setIsUrlCopied(true)
    } catch {
      toast(t("コピーできませんでした。", "Could not copy."))
    }
  }

  const badgeFor = (method: LoginMethod) =>
    lastMethod === method ? <LastUsedBadge /> : undefined

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs leading-relaxed">
        {t(
          "はじめての方も同じボタンから始められます。アカウントはそのまま作成されます。",
          "New here? Use the same buttons. Your account is created automatically.",
        )}
      </p>

      {isInApp && (
        <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed">
          <p>
            {t(
              "アプリ内のブラウザでは Google などでログインできないことがあります。うまくいかないときは、この画面を Safari や Chrome で開いてください。",
              "Google sign-in may not work in in-app browsers. If it fails, open this page in Safari or Chrome.",
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg bg-background text-xs"
            onClick={onCopyUrl}
          >
            {isUrlCopied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {isUrlCopied
              ? t("コピーしました", "Copied")
              : t("URLをコピー", "Copy URL")}
          </Button>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm leading-relaxed"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="min-w-0 break-words">{errorMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <SocialLoginButton
          disabled={isLoading}
          method="google"
          provider={new GoogleAuthProvider()}
          buttonText={t("Googleで続ける", "Continue with Google")}
          icon={<RiGoogleFill className="size-4" />}
          badge={badgeFor("google")}
          onError={setErrorMessage}
        />
        <SocialLoginButton
          disabled={isLoading}
          method="x"
          provider={new TwitterAuthProvider()}
          buttonText={t("Xで続ける", "Continue with X")}
          icon={<RiTwitterXFill className="size-4" />}
          badge={badgeFor("x")}
          onError={setErrorMessage}
        />
        <Suspense
          fallback={<LineLoggedInButton disabled={true} onClick={() => {}} />}
        >
          <LineLoggedInWithUrlButton
            text={t("LINEで続ける", "Continue with LINE")}
            badge={badgeFor("line")}
          />
        </Suspense>
      </div>

      <div className="flex items-center gap-3 text-muted-foreground text-xs">
        <span className="h-px flex-1 bg-border" />
        {t("または", "or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      {sentEmail ? (
        <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <MailCheckIcon className="size-5 shrink-0 text-emerald-600" />
            {t("確認メールを送りました", "Check your email")}
          </p>
          <p className="break-words text-muted-foreground text-xs leading-relaxed">
            {t(
              `${sentEmail} に届いたメールのリンクを開くと、ログインできます。届かないときは迷惑メールのフォルダも見てください。`,
              `Open the link we sent to ${sentEmail} to log in. If it doesn't arrive, check your spam folder.`,
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-lg"
              disabled={resendSeconds > 0 || isSendingEmailLink}
              onClick={onSendEmailLink}
            >
              {resendSeconds > 0
                ? t(
                    `もう一度送る（${resendSeconds}秒後）`,
                    `Resend (${resendSeconds}s)`,
                  )
                : t("もう一度送る", "Resend")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-lg"
              onClick={() => setSentEmail(null)}
            >
              {t("アドレスを変える", "Use another email")}
            </Button>
          </div>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault()
            void onSendEmailLink()
          }}
        >
          <div className="flex items-center justify-between">
            <label htmlFor="login-email" className="font-medium text-xs">
              {t(
                "メールアドレスで続ける（パスワードは不要です）",
                "Continue with email (no password needed)",
              )}
            </label>
            {badgeFor("email")}
          </div>
          <Input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={isLoading || isSendingEmailLink}
            className="h-12 rounded-xl text-base md:text-sm"
          />
          <Button
            type="submit"
            className="h-12 w-full rounded-xl font-semibold"
            disabled={isLoading || isSendingEmailLink}
          >
            {isSendingEmailLink ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              t("確認メールを送る", "Send me a link")
            )}
          </Button>
        </form>
      )}

      <div className="border-t pt-2">
        <button
          type="button"
          aria-expanded={isPasswordOpen}
          onClick={() => setIsPasswordOpen((value) => !value)}
          className="flex h-10 w-full items-center justify-between rounded-lg text-muted-foreground text-sm hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            {t(
              "ユーザーIDとパスワードでログイン",
              "Log in with ID and password",
            )}
            {badgeFor("password")}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              isPasswordOpen && "rotate-180",
            )}
          />
        </button>
        {isPasswordOpen && (
          <div className="pt-2">
            <PasswordLoginForm onSubmit={onLogin} isLoading={isLoading} />
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
        {t("続けると", "By continuing, you agree to the ")}
        <Link to="/terms" target="_blank" className="underline">
          {t("利用規約", "Terms")}
        </Link>
        {t("と", " and ")}
        <Link to="/privacy" target="_blank" className="underline">
          {t("プライバシーポリシー", "Privacy Policy")}
        </Link>
        {t("に同意したものとします。", ".")}
      </p>
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

const sendEmailAuthLinkMutationDocument = gql`
  mutation SendEmailAuthLink($input: SendEmailAuthLinkInput!) {
    sendEmailAuthLink(input: $input)
  }
`
