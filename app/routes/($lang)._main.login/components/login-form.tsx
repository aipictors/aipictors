import { gql, useMutation } from "@apollo/client/index"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { useEffect, useRef, useState } from "react"
import { LoginDialogContent } from "~/components/login-dialog-content"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

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
  const [loginWithEmailTokenMutation] = useMutation(
    loginWithEmailTokenMutationDocument,
  )

  const onClickHome = () => {
    window.location.href = "/home"
  }

  const navigate = useNavigate()

  const t = useTranslation()

  useEffect(() => {
    if (!emailToken || handledEmailTokenRef.current === emailToken) {
      return
    }

    handledEmailTokenRef.current = emailToken

    let isCancelled = false

    loginWithEmailTokenMutation({
      variables: {
        input: {
          token: emailToken,
        },
      },
    })
      .then(async (result) => {
        if (isCancelled) {
          return
        }

        const loginResult = result.data?.loginWithEmailToken ?? null

        if (loginResult === null) {
          setEmailTokenError(
            t(
              "メール認証に失敗しました。",
              "Email authentication failed.",
            ),
          )
          return
        }

        await signInWithCustomToken(getAuth(), loginResult.token)

        const nextParams = new URLSearchParams(window.location.search)
        nextParams.delete("emailToken")

        if (loginResult.isNew) {
          navigate("/new/profile", { replace: true })
          return
        }

        navigate(
          {
            pathname: window.location.pathname,
            search: nextParams.toString(),
          },
          { replace: true },
        )
      })
      .catch((error) => {
        if (isCancelled) {
          return
        }

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
            : t(
                "メール認証に失敗しました。",
                "Email authentication failed.",
              ),
        )
      })

    return () => {
      isCancelled = true
    }
  }, [emailToken, loginWithEmailTokenMutation, navigate, t])

  useEffect(() => {
    if (!token || handledCustomTokenRef.current === token) {
      return
    }

    handledCustomTokenRef.current = token

    let isCancelled = false

    const auth = getAuth()
    signInWithCustomToken(auth, token)
      .then(() => {
        if (isCancelled) {
          return
        }

        const nextParams = new URLSearchParams(window.location.search)
        nextParams.delete("token")

        if (isNew === "1") {
          navigate("/new/profile", { replace: true })
          return
        }

        navigate(
          {
            pathname: window.location.pathname,
            search: nextParams.toString(),
          },
          { replace: true },
        )
      })
      .catch((error) => {
        if (isCancelled) {
          return
        }

        console.error(
          t(
            "カスタムトークンによるログインに失敗しました:",
            "Login with custom token failed:",
          ),
          error,
        )
      })

    return () => {
      isCancelled = true
    }
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

  return (
    <>
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

const loginWithEmailTokenMutationDocument = gql`
  mutation LoginWithEmailToken($input: LoginWithEmailTokenInput!) {
    loginWithEmailToken(input: $input) {
      token
      isNew
    }
  }
`
