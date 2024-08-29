import { getAuth, signInWithCustomToken } from "firebase/auth"
import { useEffect } from "react"
import { LoginDialogContent } from "~/components/login-dialog-content"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { Button } from "~/components/ui/button"

/**
 * ログインフォーム
 */
export function LoginForm() {
  const [searchParams] = useSearchParams()

  const ref = searchParams.get("result")

  const token = searchParams.get("token")

  const isNew = searchParams.get("new")

  const onClickHome = () => {
    window.location.href = "/"
  }

  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      const auth = getAuth()
      signInWithCustomToken(auth, token)
        .then(() => {
          // 認証が成功したらURLからトークンを削除してリダイレクト
          searchParams.delete("token")

          if (isNew === "1") {
            navigate("/new/profile", { replace: true })
          } else {
            navigate(
              {
                pathname: window.location.pathname,
                search: searchParams.toString(),
              },
              { replace: true },
            )
          }
        })
        .catch((error) => {
          console.error("カスタムトークンによるログインに失敗しました:", error)
          // 必要に応じてエラーハンドリングを追加
        })
    }
  }, [token, isNew, navigate, searchParams])

  if (ref && ref === "verification") {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center font-bold text-sm">
          <p>{"ログインが完了いたしました！"}</p>
          <p>{"Aipictorsを引き続き楽しんでください！🎊"}</p>
        </div>
        <Button onClick={onClickHome} className="m-auto block">
          {"ホームへ"}
        </Button>
      </div>
    )
  }

  return (
    <>
      {ref && ref === "verification_error" && (
        <div className="mt-4 text-red-500 text-sm">
          {"認証に失敗いたしました、時間をおいて再度お試しください。"}
        </div>
      )}
      <LoginDialogContent />
    </>
  )
}
