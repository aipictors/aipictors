import { LoginCard } from "~/components/login-card"
import { LoginDialogContent } from "~/components/login-dialog-content"
import { useTranslation } from "~/hooks/use-translation"

/**
 * ログインページ
 * 認証の確認中（AppLoadingPage）と同じ高さにして、確認が終わったときに下のフッターが動かないようにする
 */
export function LoginPage (): React.ReactNode {
  const t = useTranslation()

  return (
    <div className="flex min-h-screen w-full items-start justify-center px-1 pt-4 pb-8 md:pt-8">
      <LoginCard
        title={t("ここから先はログインが必要です", "Please log in to continue")}
        line={t(
          "ログインしたら、続きをご案内しますね！",
          "I'll guide you onward after you log in!",
        )}
      >
        <LoginDialogContent />
      </LoginCard>
    </div>
  )
}
