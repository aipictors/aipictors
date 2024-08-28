import {} from "firebase/auth"
import {} from "react"
import { LoginDialogContent } from "~/components/login-dialog-content"
import { useSearchParams } from "@remix-run/react"
import { Button } from "~/components/ui/button"

/**
 * ログインフォーム
 */
export function LoginForm() {
  const [searchParams] = useSearchParams()

  const ref = searchParams.get("result")

  const onClickHome = () => {
    window.location.href = "/"
  }

  if (ref && ref === "verification") {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center font-bold text-sm">
          <p>{"認証が完了いたしました！"}</p>
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
