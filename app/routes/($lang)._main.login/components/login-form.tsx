import { gql, useMutation } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { Loader2Icon } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { LoginDialogContent } from "~/components/login-dialog-content"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { rememberLoginNext, takeLoginNext } from "~/utils/login-flow"

/**
 * ログインフォーム
 */
export function LoginForm() {
  const [searchParams] = useSearchParams()

  const ref = searchParams.get("result")

  const token = searchParams.get("token")
  const emailToken = searchParams.get("emailToken")

  const isNew = searchParams.get("new")
  const [emailTokenError, setEmailTokenError] = useState<string | null>(null)
  const handledEmailTokenRef = useRef<string | null>(null)
  const handledCustomTokenRef = useRef<string | null>(null)
  const hasRedirectedRef = useRef(false)
  const [customTokenError, setCustomTokenError] = useState<string | null>(null)
  const authContext = useContext(AuthContext)
  const [checkProfile] = useMutation(isInitializedUserProfileMutationDocument)
  const [loginWithEmailTokenMutation] = useMutation(
    loginWithEmailTokenMutationDocument,
  )

  const onClickHome = () => {
    window.location.href = "/"
  }

  const navigate = useNavigate()

  const t = useTranslation()

  // ログイン後の行き先を、ログインする前に覚えておく（LINE は別のサイトを経由して戻ってくる）
  useEffect(() => {
    rememberLoginNext({
      nextParam: searchParams.get("next"),
      referrer: document.referrer,
      origin: window.location.origin,
    })
  }, [searchParams])

  // ログインできたら、このページに留まらず次へ進む（どのログイン方法でも）
  useEffect(() => {
    if (
      authContext.isLoading ||
      !authContext.isLoggedIn ||
      ref === "verification" ||
      hasRedirectedRef.current
    ) {
      return
    }
    hasRedirectedRef.current = true

    const goNext = (isInitialized: boolean) => {
      const next = takeLoginNext()
      navigate(isInitialized ? (next ?? "/") : "/new/profile", {
        replace: true,
      })
    }

    checkProfile()
      .then((result) => {
        goNext(result.data?.isInitializedUserProfile !== false)
      })
      .catch(() => {
        goNext(true)
      })
  }, [
    authContext.isLoading,
    authContext.isLoggedIn,
    checkProfile,
    navigate,
    ref,
  ])

  useEffect(() => {
    if (!emailToken || handledEmailTokenRef.current === emailToken) {
      return
    }

    handledEmailTokenRef.current = emailToken

    // メール認証トークンは一度しか使えないため、再レンダリング（t や navigate の
    // 再生成）で effect が破棄されても処理結果を捨てずにログインまで完了させる
    loginWithEmailTokenMutation({
      variables: {
        input: {
          token: emailToken,
        },
      },
    })
      .then(async (result) => {
        const loginResult = result.data?.loginWithEmailToken ?? null

        if (loginResult === null) {
          setEmailTokenError(
            t("メール認証に失敗しました。", "Email authentication failed."),
          )
          return
        }

        await signInWithCustomToken(getAuth(), loginResult.token)

        if (loginResult.isNew) {
          navigate("/new/profile", { replace: true })
        }
        // 既存のアカウントは、上のログイン後の処理で次へ進む
      })
      .catch((error) => {
        console.error(
          t(
            "メール認証によるログインに失敗しました:",
            "Login with email token failed:",
          ),
          error,
        )
        setEmailTokenError(
          error instanceof Error
            ? error.message
            : t("メール認証に失敗しました。", "Email authentication failed."),
        )
      })
  }, [emailToken, loginWithEmailTokenMutation, navigate, t])

  useEffect(() => {
    if (!token || handledCustomTokenRef.current === token) {
      return
    }

    handledCustomTokenRef.current = token

    const auth = getAuth()
    signInWithCustomToken(auth, token)
      .then(() => {
        if (isNew === "1") {
          navigate("/new/profile", { replace: true })
        }
        // 既存のアカウントは、上のログイン後の処理で次へ進む
      })
      .catch((error) => {
        console.error(
          t(
            "カスタムトークンによるログインに失敗しました:",
            "Login with custom token failed:",
          ),
          error,
        )
        setCustomTokenError(
          t(
            "ログインの途中で失敗しました。もう一度お試しください。",
            "Sign-in failed. Please try again.",
          ),
        )
      })
  }, [isNew, navigate, t, token])

  if (ref && ref === "verification") {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center font-bold text-sm">
          <p>{t("ログインが完了いたしました！", "Login completed!")}</p>
          <p>
            {t(
              "Aipictorsを引き続き楽しんでください！🎊",
              "Enjoy Aipictors! 🎊",
            )}
          </p>
        </div>
        <Button onClick={onClickHome} className="m-auto block">
          {t("ホームへ", "Go to Home")}
        </Button>
      </div>
    )
  }

  // リンクから戻ってきて処理している間と、ログイン後に次へ進むまでは、入力欄を見せない
  const isFinishing =
    authContext.isLoggedIn ||
    ((token || emailToken) && !emailTokenError && !customTokenError)

  if (isFinishing) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 py-10 text-muted-foreground text-sm"
      >
        <Loader2Icon className="size-6 animate-spin" />
        {t("ログインしています…", "Logging you in…")}
      </div>
    )
  }

  return (
    <>
      {customTokenError && (
        <div className="mt-4 text-red-500 text-sm">{customTokenError}</div>
      )}
      {ref && ref === "verification_error" && (
        <div className="mt-4 text-red-500 text-sm">
          {t(
            "認証に失敗いたしました、時間をおいて再度お試しください。",
            "Verification failed, please try again later.",
          )}
        </div>
      )}
      {emailTokenError && (
        <div className="mt-4 text-red-500 text-sm">{emailTokenError}</div>
      )}
      <LoginDialogContent />
    </>
  )
}

const isInitializedUserProfileMutationDocument = gql`
  mutation IsInitializedUserProfile {
    isInitializedUserProfile
  }
`

const loginWithEmailTokenMutationDocument = gql`
  mutation LoginWithEmailToken($input: LoginWithEmailTokenInput!) {
    loginWithEmailToken(input: $input) {
      token
      isNew
    }
  }
`
